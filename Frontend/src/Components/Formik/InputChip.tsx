import React, { FunctionComponent, memo, useState } from 'react'
import useDebounceEffect from '../../Hooks/useDebounceEffect'
import './InputChip.scss'
import { TInputChip } from './types'

const InputChip: FunctionComponent<TInputChip> = ({
  onChange,
  label,
  placeholder,
  prefix,
  suffix,
  type,
  error,
  required,
  value,
  delay,
  hideLabel,
  emailValidation,
  ...props
}) => {
  const [text, setText] = useState('')
  const [val, setValue] = useDebounceEffect((v: Array<string>) => onChange?.(props.name, v), value, delay)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!props.disabled && onChange) {
      setText(e.target.value)
    }
  }

  const handleDelete = (item: string) => {
    setValue(value.filter((i) => i !== item))
  }

  const onBlur = (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    evt.preventDefault()
    const textValue = text.trim()

    if (!props.disabled && onChange && textValue && isValid(textValue)) {
      setValue([...val, textValue])
    }

    setText('')
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (['Enter', 'Tab', ','].includes(evt.key)) {
      evt.preventDefault()
      const textValue = text.trim()

      if (!props.disabled && onChange && textValue && isValid(textValue)) {
        setValue([...val, textValue])
      }

      setText('')
    }
  }

  const isValid = (email: string) => {
    if (value.indexOf(email) >= 0) {
      return false
    }

    if (emailValidation ? !email.match(/[\w\d.-]+@[\w\d.-]+\.[\w\d.-]+/g) : false) {
      return false
    }

    return true
  }

  return (
    <div className="custom-input-box">
      {label && !hideLabel && (
        <label style={{ textAlign: 'left' }}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}

      <div className="email-chip">
        {val &&
          val.map((item) => (
            <div className="tag-item" key={item}>
              {item}
              <button type="button" className="button" onClick={() => handleDelete(item)}>
                &times;
              </button>
            </div>
          ))}

        <input
          className="email-chip-input"
          placeholder={placeholder}
          value={text}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onBlur={onBlur}
        />
      </div>

      {error && (
        <div style={{ fontSize: 10, color: 'red', textAlign: 'right' }}>
          {error.replace(props.name, label || placeholder || '')}
        </div>
      )}
    </div>
  )
}

export default memo(InputChip)
