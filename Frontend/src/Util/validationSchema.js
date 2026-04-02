import * as Yup from 'yup'

const message = '${path} required'

export const addressFieldSchema = Yup.object().shape({
  // buildingNo: Yup.string().required(message),
  street: Yup.string().required(message),
  city: Yup.string().required(message),
  // district: Yup.string().required(message),
  postalCode: Yup.string().required(message),
  country: Yup.string().required(message)
})

export const invoiceEmailSchema = Yup.object().shape({
  email: Yup.string()
    .email()
    .when('showEmail', {
      is: true,
      then: Yup.string().required(message)
    })
})
