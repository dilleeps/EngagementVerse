import { UserType } from '../Actions/ActionType'
import { setDefaultTimeZone, updateAccessData } from '../Util/Util'

const initialState = {
  userInfo: false,
  adminUser: false,
  companyInfo: false,
  access: [],
  lang: 'en',
  masterOptions: []
}

const getUser = (state, action) => {
  const newState = {}
  const access = action.payload.roleData ? action.payload.roleData.access || [] : []

  if (action.payload.company && action.payload.userType === 'Admin') {
    access.push('adminAccess')
  } else if (action.payload.userType === 'Admin') {
    access.push('add-company')
  }

  if (action.payload?.companyData?.timeZone) {
    setDefaultTimeZone(action.payload.companyData?.timeZone)
  }

  updateAccessData(access)
  Object.assign(newState, state, {
    userInfo: action.payload,
    companyInfo: action.payload.companyData
  })

  return newState
}

const setData = (state, action) => {
  const newState = {}
  Object.assign(newState, state, action.payload)

  return newState
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case UserType.GET_USER: {
      return getUser(state, action)
    }

    case UserType.SET_USER_REDUCER: {
      return setData(state, action)
    }

    default: {
      return state
    }
  }
}
