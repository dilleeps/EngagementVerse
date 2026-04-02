import { Buffer } from 'buffer'
import { message } from 'antd'
import { get, set } from 'lodash'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import { useEffect, useRef, useState } from 'react'
import AppConfig from '../config'
import store from '../store/store'
import apiClient from './apiClient'

const APP_CACHE = { data: {} }

export const SET_DATA = (key, value) => {
  set(APP_CACHE.data, key, value)
}

export const GET_DATA = (key) => get(APP_CACHE.data, key)

export const CLEAR_DATA = () => set(APP_CACHE, 'data', {})

let accessData = []

export const updateAccessData = (data) => {
  const commonAccess = [
    // '/app/dashboard',
    '/app/changePassword',
    '/app/profile',
    '/app/manage-company'
  ]
  const access = [...commonAccess, ...data]
  accessData = access
}

export const emailValidate = (value) => {
  const pattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  return pattern.test(value) === false
}

export const numberValidate = (value) => {
  const pattern = /^[0-9]*$/

  return pattern.test(value) === false
}

export const urlValidate = (value) => {
  const pattern =
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g

  return pattern.test(value) === false
}

export const convertSelectOptions = (options, label, value) =>
  options.map((data) => {
    data.label = typeof label === 'object' ? label.map((v) => data[v] || v).join(' ') : data[label]
    data.value = data[value]

    return data
  })

export const avatarLetter = (str) => (str ? str.charAt(0) : '')

export const amountToWords = (wholeNumber, currencyObj) => {
  const NumberToWordInt = (Number) => {
    Number = parseInt(Number, 10)

    if (Number === 0) {
      return 'Zero'
    }

    if (Number < 0) {
      return `Minus ${NumberToWordInt(Math.abs(Number))}`
    }

    let words = ''

    if (parseInt(Number / 1000000, 10) > 0) {
      words += `${NumberToWordInt(Number / 1000000, words)} Million `
      Number %= 1000000
    }

    if (parseInt(Number / 1000, 10) > 0) {
      words += `${NumberToWordInt(Number / 1000)} Thousand `
      Number %= 1000
    }

    if (parseInt(Number / 100, 10) > 0) {
      words += `${NumberToWordInt(Number / 100)} Hundred `
      Number %= 100
    }

    if (Number > 0) {
      if (words !== '') {
        words += 'and '
      }

      const unitsMap = [
        'Zero',
        'One',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine',
        'Ten',
        'Eleven',
        'Twelve',
        'Thirteen',
        'Fourteen',
        'Fifteen',
        'Sixteen',
        'Seventeen',
        'Eighteen',
        'Nineteen'
      ]

      const tensMap = [
        'zero',
        'Ten',
        'Twenty',
        'Thirty',
        'Forty',
        'Fifty',
        'Sixty',
        'Seventy',
        'Eighty',
        'Ninety'
      ]

      if (Number < 20) {
        words += unitsMap[Number]
      } else {
        words += tensMap[parseInt(Number / 10, 10)]

        if (Number % 10 > 0) {
          words += `-${unitsMap[parseInt(Number % 10, 10)]}`
        }
      }
    }

    return words
  }

  const Numbers = parseFloat(wholeNumber).toFixed(2)
  const splits = Numbers.toString().split('.')
  let Result = ''

  if (splits.length > 1) {
    Result = NumberToWordInt(parseInt(splits[0], 10))
    let Reminders = ''
    Reminders = NumberToWordInt(parseInt(splits[1], 10))

    return `${Result} ${currencyObj ? currencyObj.name : ''} and ${Reminders} ${
      currencyObj ? currencyObj.unit : ''
    }`
  }

  return NumberToWordInt(parseInt(wholeNumber, 10))
}

export const amountSeparator = (value) => {
  const amount = value ? parseFloat(value).toFixed(2) : '0.00'

  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const generateId = (ID_LENGTH) => {
  let rtn = ''

  for (let i = 0; i < (ID_LENGTH || 5); i++) {
    rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length))
  }

  return rtn
}

export const validateAccess = (page, withPath) => {
  if (accessData.indexOf('adminAccess') >= 0) {
    return true
  }

  if (accessData && page) {
    if (typeof page === 'string') {
      return accessData.includes(
        withPath ? page.substr(5, page.indexOf(':') > 0 ? page.indexOf('/:') - 5 : page.length) : page
      )
    }

    return page.filter((e) => accessData.includes(e)).length > 0
  }
}

export const removeEmptyKeys = (values) => {
  const newValue = {}
  Object.keys(values).forEach((val) => {
    const checkArr = typeof values[val] === 'object' ? Object.keys(values[val] || []).length > 0 : true

    if (values[val] !== '' && values[val] !== 0 && checkArr) {
      newValue[val] = values[val]
    }
  })

  return newValue
}

/** Using this method we call the callback method when state is change */
export const useStateCallback = (initialState) => {
  const [state, setState] = useState(initialState)
  const cbRef = useRef(null) // mutable ref to store current callback

  const setStateCallback = (newState, cb) => {
    cbRef.current = cb // store passed callback to ref
    setState(newState)
  }

  useEffect(() => {
    // cb.current is `null` on initial render, so we only execute cb on state *updates*
    if (cbRef.current) {
      cbRef.current(state)
      cbRef.current = null // reset callback after execution
    }
  }, [state])

  return [state, setStateCallback]
}

export const checkMoment = (date) => (date && moment.isMoment(moment(date)) ? moment(date) : null)

export const getImageUrl = (path) =>
  /* eslint-disable-next-line */
  path ? `${AppConfig.API_URL}/assets/${path}` : require('../assets/images/empty_img.png').default

export const getDocPath = (path) => (path ? `${AppConfig.API_URL}/assets/${path}` : '')

export const roundOf = (value, decimals = 2) => Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`)

export const parseAmount = (value, currency, noFormat) => {
  const newState = store.getState()
  const defaultCurrency = currency || newState.users.companyInfo?.currency
  const currencyData = newState.users.userInfo?.currencies?.find((v) => v.code === defaultCurrency) || {
    decimalLength: 2,
    format: ','
  }
  const amt = parseFloat(
    value && !Number.isNaN(value) ? roundOf(value, currencyData.decimalLength) : 0
  )?.toFixed(currencyData.decimalLength)

  return noFormat ? amt : amt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, currencyData.format)
}

export const sanitize = (html) => {
  const d = document.createElement('div')
  d.innerHTML = html

  return {
    dangerouslySetInnerHTML: {
      __html: d.innerHTML
    }
  }
}

const print = (data) => {
  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)

  iframe.style.display = 'none'
  iframe.src = window.URL.createObjectURL(data)

  iframe.onload = () => {
    setTimeout(() => {
      iframe.focus()
      iframe.contentWindow.print()
    }, 1)
  }
}

const download = (data, headers) => {
  const a = document.createElement('a')
  a.href = window.URL.createObjectURL(data)
  a.download = JSON.parse(headers['content-disposition'].split('filename=')[1].split(';')[0])
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export const downloadPrintPDF = (url, { printType = 'Single', ...query }, isPrint = false) =>
  new Promise((resolve) => {
    apiClient
      .post(url, { printType, ...query }, { responseType: 'blob' })
      .then(({ status, data, headers }) => {
        if (status === 200) {
          if (isPrint) {
            print(data)
          } else {
            download(data, headers)
          }

          resolve('success')
        }

        resolve()
      })
  })

export const base64Decode = (data) => {
  const buff = Buffer.from(data, 'base64')

  return buff.toString('utf8')
}

export const setDefaultTimeZone = (timezone = null) => {
  momentTimezone.tz.setDefault(timezone)
}

export const formatDate = (date, withTime) =>
  date ? moment(date).format(withTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD') : '-'

export const startOfDay = (v) => moment(v).startOf('day').format()

export const endOfDay = (v) => moment(v).endOf('day').format()

export const bytesToSize = (bytes, decimals = 2) => {
  if (!bytes) {
    return '-'
  }

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

export const downloadFromUrl = (endpoint, fileName, params = {}) => {
  apiClient.get(endpoint, { params }).then(async ({ data }) => {
    if (data?.result) {
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(new Blob([data.result]))
      a.download = fileName
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      message.error('File not found!')
    }
  })
}

export const decamelize = (text = '') =>
  (text.charAt(0).toUpperCase() + text.slice(1)).split(/(?=[A-Z])/).join(' ')
