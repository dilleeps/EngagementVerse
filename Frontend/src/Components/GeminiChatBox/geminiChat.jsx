/* eslint-disable */
import {
  AudioOutlined,
  CameraOutlined,
  CloseOutlined,
  FileTextOutlined,
  SendOutlined,
  SoundFilled,
  SoundOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Button, Input, Skeleton, Upload } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import apiClient from '../../Util/apiClient'
import './chatStyle.scss'
import { fetchActiveClients } from './controller'
import ChatButton from './previewButton'

const ChatPopup = ({ onClose }) => {
  const [chatHistory, setChatHistory] = useState([])
  const [textInput, setTextInput] = useState('')
  const [helloSent, setHelloSent] = useState(false)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const { transcript, listening, resetTranscript } = useSpeechRecognition()
  const chatEndRef = useRef(null)
  const pauseTimerRef = useRef(null)
  const [sessionId] = useState(() => Math.floor(Math.random() * 1000000))
  const [speechSynth] = useState(window.speechSynthesis)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [docFile, setDocFile] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isResponseReadAloud, setIsResponseReadAloud] = useState(false)
  const [activeClients, setActiveClients] = useState([])
  const [stopAutoVoice, setStopAutoVoice] = useState(false)
  const history = useHistory()

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clients = await fetchActiveClients()
        setActiveClients(clients)
        console.log('Fetched active clients:', clients)
      } catch (error) {
        console.error('Error fetching active clients:', error)
      }
    }

    fetchClients()
  }, [])

  useEffect(() => {
    const voices = speechSynth.getVoices()

    const selectUKMaleVoice = (voices) => {
      return voices.find((voice) => voice.name === 'Google UK English Male')
    }

    if (voices.length > 0) {
      setSelectedVoice(selectUKMaleVoice(voices))
      setVoicesLoaded(true)
    } else {
      speechSynth.onvoiceschanged = () => {
        const voicesList = speechSynth.getVoices()
        console.log(voicesList)
        setSelectedVoice(selectUKMaleVoice(voicesList))
        setVoicesLoaded(true)
      }
    }
  }, [speechSynth])

  const addToChatHistory = (message, sender) => {
    setChatHistory((prev) => [...prev, { sender, message }])
  }

  const handleVoiceInput = async () => {
    resetTranscript()
    SpeechRecognition.startListening({ continuous: true })
    startPauseTimer()
  }

  const stopVoiceInput = () => {
    SpeechRecognition.stopListening()
    clearTimeout(pauseTimerRef.current)
  }

  const startPauseTimer = () => {
    clearTimeout(pauseTimerRef.current)
    if (transcript.trim()) {
      pauseTimerRef.current = setTimeout(() => {
        stopVoiceInput()
        sendTranscript()
      }, 1500)
    }
  }

  const sendTranscript = () => {
    if (transcript && transcript.trim()) {
      addToChatHistory(transcript, 'user')
      sendToGeminiAPI(transcript)
      resetTranscript()
    }
  }

  const handleImageUpload = (file) => {
    setImageFile(file)
    return false
  }

  const handleImageRemove = () => {
    setImageFile(null)
  }

  const handleDocUpload = (file) => {
    setDocFile(file)
    return false
  }

  const handleDocRemove = () => {
    setDocFile(null)
  }

  const sendToGeminiAPI = async (userInput) => {
    addToChatHistory('Loading...', 'ai')
    const formData = new FormData()
    formData.append('input', userInput)
    formData.append('SessionId', sessionId)
    formData.append('clients', activeClients)

    if (imageFile) {
      formData.append('image', imageFile)
    }

    if (docFile) {
      formData.append('document', docFile)
    }

    try {
      const response = await apiClient.post(`/assistant/gemini`, { input: userInput })

      if (response.status >= 200 && response.status < 300) {
        let aiResponse = response.data.rewrittenText || response.data

        const jsonRegex = /```json([\s\S]*?)```/
        const match = aiResponse.match(jsonRegex)

        if (match && match[1]) {
          const jsonString = match[1].trim()

          try {
            const parsedJson = JSON.parse(jsonString)
            console.log('JSON detected', parsedJson)

            const isValidInvoiceJson = (json) => {
              return (
                json.invoiceType !== undefined &&
                json.invoiceTransaction === 'Regular' &&
                json.kind === 'Invoice' &&
                json.clientData &&
                typeof json.clientData === 'object' &&
                json.invoiceNo &&
                json.currency &&
                json.issueDate &&
                Array.isArray(json.items) &&
                json.poValue !== undefined
              )
            }

            if (isValidInvoiceJson(parsedJson)) {
              try {
                const { data } = await apiClient.post('incomes/add', parsedJson)
                console.log('Successfully saved to DB:', data.result)
                history.push(`/app/incomes/${data.result.id}`)
                setStopAutoVoice(true)
                aiResponse = 'Invoice saved successfully!'
              } catch (error) {
                console.error('Error saving to DB:', error)
                aiResponse = 'Error saving invoice to the database.'
              }
            } else {
              console.warn('Invalid JSON structure')
            }
          } catch (jsonError) {
            console.error('Error parsing JSON', jsonError)
          }
        }

        setChatHistory((prev) => {
          const updatedHistory = [...prev]
          updatedHistory[updatedHistory.length - 1] = { sender: 'ai', message: aiResponse }
          return updatedHistory
        })

        const containsSummary = aiResponse.toLowerCase().includes('summary')
        if (voicesLoaded && selectedVoice && typeof aiResponse === 'string') {
          if (containsSummary) {
            readAloudText(
              'Here is the summary. Please review it carefully. Once checked please say yes its correct to generate Invoice'
            )
          } else {
            readAloudText(aiResponse)
          }
        }

        setIsResponseReadAloud(false)
      } else {
        setChatHistory((prev) => {
          const updatedHistory = [...prev]
          updatedHistory[updatedHistory.length - 1] = {
            sender: 'ai',
            message: 'Error: ' + response.statusText
          }
          return updatedHistory
        })
      }
    } catch (error) {
      setChatHistory((prev) => {
        const updatedHistory = [...prev]
        updatedHistory[updatedHistory.length - 1] = { sender: 'ai', message: 'Please Speak Again' }
        return updatedHistory
      })
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (speechSynth.speaking) {
      speechSynth.cancel()
    }
  }

  const readAloudText = (text) => {
    if (isMuted || !text) return

    speechSynth.cancel()

    const utterance = new SpeechSynthesisUtterance()
    utterance.voice = selectedVoice

    const maxCharLength = 120
    const textChunks = []

    for (let i = 0; i < text.length; i += maxCharLength) {
      textChunks.push(text.slice(i, i + maxCharLength))
    }

    const speakNextChunk = () => {
      if (textChunks.length === 0 || isMuted) {
        setIsResponseReadAloud(true)
        return
      }

      utterance.text = textChunks.shift()
      utterance.onend = speakNextChunk
      speechSynth.speak(utterance)
    }

    speakNextChunk()
  }

  const handleTextInputChange = (e) => {
    setTextInput(e.target.value)
  }

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      addToChatHistory(textInput, 'user')
      sendToGeminiAPI(textInput)
      setTextInput('')
      setImageFile(null)
      setDocFile(null)
    }
  }

  useEffect(() => {
    if (isResponseReadAloud && !stopAutoVoice) {
      handleVoiceInput()
      setIsResponseReadAloud(false)
    }
  }, [isResponseReadAloud, stopAutoVoice])

  useEffect(() => {
    if (transcript) {
      startPauseTimer()
    }
  }, [transcript])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory])

  useEffect(() => {
    if (!helloSent && voicesLoaded) {
      sendToGeminiAPI('hello')
      setHelloSent(true)
    }
  }, [helloSent, voicesLoaded])

  const renderChatMessage = (chat) => {
    if (chat.message.toLowerCase().includes('summary')) {
      return (
        <>
          <pre className="json-response">{chat.message}</pre>
          <div>
            <p>Please confirm the details to generate Invoice</p>
            <div className="confirm-area">
              <Button onClick={() => handleResponseApproval(true)}>Yes</Button>
              <Button onClick={() => handleResponseApproval(false)}>No</Button>
            </div>
          </div>
        </>
      )
    } else if (Array.isArray(chat.message)) {
      return (
        <ul>
          {chat.message.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )
    } else if (typeof chat.message === 'object') {
      return <pre className="json-response">{JSON.stringify(chat.message, null, 2)}</pre>
    } else {
      return <span>{chat.message}</span>
    }
  }

  const handleResponseApproval = async (approved) => {
    if (approved) {
      sendToGeminiAPI('yes its correct')
    } else {
      sendToGeminiAPI('no its incorrect')
    }
  }

  return (
    <div className="chat-popup">
      <div className="chat-header">
        <div className="header">
          <img className="logo" src="/logo512.png" alt="Logo" />
          <span>Accqrate Assistant</span>
        </div>
        <div>
          <Button
            type="link"
            icon={isMuted ? <SoundOutlined /> : <SoundFilled />}
            onClick={toggleMute}
            aria-label="Toggle Mute"></Button>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} aria-label="Close" />
        </div>
      </div>
      <div className="chat-body">
        <div className="chat-history">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.sender}`}>
              <strong>
                {chat.sender === 'user' ? (
                  <UserOutlined />
                ) : (
                  <img className="chat-logo" src="/logo512.png" alt="AI Logo" />
                )}
                :
              </strong>{' '}
              {chat.sender === 'ai' && chat.message === 'Loading...' ? (
                <Skeleton
                  paragraph={{
                    rows: 2
                  }}
                  active
                />
              ) : (
                renderChatMessage(chat)
              )}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>
      </div>
      <div className="chat-controls">
        {listening ? (
          <div className="listening-window">
            <span>Listening...</span>
            <Button type="default" onClick={stopVoiceInput} aria-label="Stop">
              cancel
            </Button>
          </div>
        ) : (
          <>
            <div className="chat-prompts">
              <Button
                type="link"
                onClick={handleVoiceInput}
                icon={<AudioOutlined />}
                aria-label="Send a message">
                Speak
              </Button>
              <Upload
                beforeUpload={handleImageUpload}
                onRemove={handleImageRemove}
                fileList={imageFile ? [imageFile] : []}
                accept="image/*"
                maxCount={1}>
                <Button type="link" icon={<CameraOutlined />}>
                  Image
                </Button>
              </Upload>
              <Upload
                beforeUpload={handleDocUpload}
                onRemove={handleDocRemove}
                fileList={docFile ? [docFile] : []}
                accept=".pdf,.doc,.docx,.txt"
                maxCount={1}>
                <Button type="link" icon={<FileTextOutlined />}>
                  Docs
                </Button>
              </Upload>
            </div>

            <div className="text-bar">
              <Input
                value={textInput}
                onChange={handleTextInputChange}
                onPressEnter={handleTextSubmit}
                placeholder="Message Accqrate"
                suffix={<SendOutlined onClick={handleTextSubmit} />}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const VoiceChatButton = () => {
  const [isPopupOpen, setPopupOpen] = useState(false)

  const openChatPopup = () => {
    setPopupOpen(true)
  }

  const closeChatPopup = () => {
    setPopupOpen(false)
  }

  return (
    <div>
      {isPopupOpen && <ChatPopup onClose={closeChatPopup} />}
      {!isPopupOpen && <ChatButton onClick={openChatPopup} />}
    </div>
  )
}

export default VoiceChatButton
