import { flatten } from 'flat'
import { useFormikContext } from 'formik'
import { useEffect } from 'react'

const ErrorFocus = () => {
  const { errors, isSubmitting, isValidating } = useFormikContext()
  const [firstErrorInput] = Object.keys(flatten(errors))

  useEffect(() => {
    if (isSubmitting && !isValidating && firstErrorInput) {
      const timeout = setTimeout(() => {
        document
          .getElementsByName(firstErrorInput)[0]
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        clearTimeout(timeout)
      }, 1)
    }
  }, [isSubmitting, isValidating, firstErrorInput])

  return null
}

export default ErrorFocus
