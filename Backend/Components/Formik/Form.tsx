import { Form as FormikForm, useFormikContext } from 'formik'
import React, { ReactNode, useEffect } from 'react'
import ErrorFocus from './ErrorFocus'

type TForm = {
  children: ReactNode
}

export default function Form({ children, ...props }: TForm) {
  const { setTouched } = useFormikContext()

  useEffect(() => {
    setTouched({})
  }, [])

  return (
    <FormikForm {...props}>
      {children}
      <ErrorFocus />
    </FormikForm>
  )
}
