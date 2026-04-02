import { message } from 'antd'
import axios from 'axios'
import { loaderRef } from '../App'
import AppConfig from '../config'

let loaderCount = 0

const apiClient = axios.create({
  baseURL: `${AppConfig.API_URL}/`
})

apiClient.interceptors.request.use(
  (config) => {
    loaderRef.barRef?.current.toggleLoader(true)
    loaderCount += 1

    return {
      ...config,
      headers: {
        Authorization: config.headers.Authorization || `Bearer ${localStorage.getItem('ACCOUNTING_USER')}`
      }
    }
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => {
    loaderRef.barRef?.current?.toggleLoader(loaderCount !== 1)
    loaderCount -= 1

    return response
  },
  async ({ response }) => {
    loaderRef.barRef?.current?.toggleLoader(false)
    loaderCount -= 1

    if (response) {
      const { data, status } = response

      if (status === 401) {
        message.error(data.message)
        localStorage.removeItem('ACCOUNTING_USER')
        window.location.href = '/login'

        return response
      }

      if (status >= 400 && status < 500) {
        if (data.errors && Object.keys(data.errors).length > 0) {
          errorsParser(data.errors)
        } else if (data.message) {
          message.error(data.message)
        }

        return Promise.resolve({ status, ...data })
      }

      if (status >= 500) {
        errorsParser(data.errors)

        return Promise.resolve({ status, ...data })
      }

      return Promise.resolve({ status, ...data })
    }
  }
)

const errorsParser = (errors) => {
  if (errors) {
    if (typeof errors === 'string') {
      message.error(errors)
    } else {
      Object.values(errors).forEach((err) => {
        message.error(err)
      })
    }
  }
}

export default apiClient
