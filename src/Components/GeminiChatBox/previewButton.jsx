import { WechatOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useEffect, useState } from 'react'
import './chatStyle.scss'

const ChatButton = ({ onClick }) => {
  const [buttonText, setButtonText] = useState('Hello Im Accqrate Assistant👋')

  const texts = [
    'Need help with your invoice? 🌟',
    'Simply tap and talk to complete your invoice!',
    'Give it a shot-click here to start! 🎉',
    'Making invoice filling a breeze!',
    'Stuck on an invoice? We’re here to help! 📋',
    'Just speak to effortlessly fill your invoice!',
    'Ready to simplify your invoicing? Click here! 🚀',
    'Easily fill out invoices in no time!'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setButtonText((prevText) => {
        const currentIndex = texts.indexOf(prevText)
        const nextIndex = (currentIndex + 1) % texts.length

        return texts[nextIndex]
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Button className="chat-btn" type="primary" icon={<WechatOutlined />} onClick={onClick}>
      <span className="text-container">{buttonText}</span>
    </Button>
  )
}

export default ChatButton
