import { message } from 'antd'
import axios from 'axios'
import AppConfig from '../config'
import { UserType } from './ActionType'
import setAuthorizationToken from './setAuthorizationToken'

const { API_URL } = AppConfig

const convertToQuery = (query) => {
  let url = ''

  if (query && Object.keys(query).length > 0) {
    const queryArr = Object.keys(query)
      .map((val) => `${val}=${query[val]}`)
      .join('&')
    url += `?${queryArr}`
  }

  return url
}

export const register = (data) =>
  axios
    .post(`${API_URL}/networks/register`, data)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      message.error(res.data.message)

      return undefined
    })
    .catch(() => {
      message.error('Register failed')
    })

export const login = (data) =>
  function (dispatch) {
    return axios
      .post(`${API_URL}/auth`, data)
      .then((res) => {
        setAuthorizationToken(res.data.token)
        dispatch({ type: UserType.GET_USER, payload: res.data.result })

        return res.data
      })
      .catch(() => {
        message.error('Invalid Credentials')
      })
  }

// ---------- User ---------- //

export const getUserByToken = (token) =>
  function (dispatch) {
    return axios
      .get(`${API_URL}/users/byToken`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data.success) {
          setAuthorizationToken(token)
          dispatch({ type: UserType.GET_USER, payload: res.data.result })

          return res.data.result
        }

        return undefined
      })
      .catch(() => {
        localStorage.removeItem('ACCOUNTING_USER')
        window.location.href = '/login'
      })
  }

export const updateUser = (id, data) =>
  function (dispatch) {
    return axios.put(`${API_URL}/users/update/${id}`, data).then((res) => {
      if (res.data.success) {
        dispatch({ type: UserType.GET_USER, payload: res.data.result })

        return res.data.result
      }

      return undefined
    })
  }

export const changePassword = (id, data) =>
  axios.put(`${API_URL}/users/changePassword/${id}`, data).then((res) => {
    if (res.data.success) {
      return res.data.result
    }

    return undefined
  })

export const sendUserInvitaion = (data) =>
  axios
    .put(`${API_URL}/users/sendInvitaion`, data)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      return undefined
    })
    .catch(() => {
      message.error('Sending invitaion failed')
    })

export const resetUserPasword = (id, data) =>
  axios
    .put(`${API_URL}/users/resetUserPasword/${id}`, data)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      return undefined
    })
    .catch(() => {
      message.error('Reseting password failed')
    })

// ---------- Tokens ---------- //

export const validateToken = (token) =>
  axios
    .get(`${API_URL}/tokens/validateToken/${token}`)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      return undefined
    })
    .catch(() => {
      message.error('Validating token failed')
    })

export const closeToken = (token) =>
  axios.put(`${API_URL}/tokens/closeToken/${token}`).then((res) => {
    if (res.data.success) {
      return res.data.result
    }

    return undefined
  })

// ---------- Company ---------- //

export const getCompanies = (data) =>
  axios
    .get(`${API_URL}/companies/getAll`, data)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      return undefined
    })
    .catch(() => {
      message.error('Getting company failed')
    })

export const createCompanyByInvitation = (data) =>
  axios
    .post(`${API_URL}/companies/createCompanyByInvitation`, data)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      message.error(res.data.message)

      return undefined
    })
    .catch(() => {
      message.error('Setting up company failed')
    })

// ---------- Currency ---------- //

export const getActiveCurrencies = (data) =>
  axios
    .get(`${API_URL}/currencies/getAllActive`, data)
    .then((res) => {
      if (res.data.success) {
        return res.data.result.map((val) => ({
          ...val,
          label: `${val.code} - ${val.name}`,
          value: val.code
        }))
      }

      return []
    })
    .catch(() => {
      message.error('Getting currency failed')
    })

// ---------- Clients ---------- //

export const getActiveClients = () =>
  axios
    .get(`${API_URL}/clients/getAllActive`)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      return undefined
    })
    .catch(() => {
      message.error('Getting client failed')
    })

// ---------- Roles ---------- //

export const addRole = (data) =>
  axios
    .post(`${API_URL}/roles/add`, data)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      return undefined
    })
    .catch(() => {
      message.error('Adding role failed')
    })

export const getRoles = (query) => {
  const url = query ? `${API_URL}/roles/getAll?${query}` : `${API_URL}/roles/getAll`

  return axios
    .get(url)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      return undefined
    })
    .catch(() => {
      message.error('Getting roles failed')
    })
}

export const updateRoles = (data) =>
  axios
    .put(`${API_URL}/roles/updateAll`, data)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      return undefined
    })
    .catch(() => {
      message.error('Updating roles failed')
    })

export const getLogs = (query) => {
  const url = `${API_URL}/logs/getLogs/${convertToQuery(query)}`

  return axios
    .get(url)
    .then((res) => {
      if (res.data.success) {
        return res.data.result
      }

      return undefined
    })
    .catch(() => {
      message.error('Getting Logs failed')
    })
}
