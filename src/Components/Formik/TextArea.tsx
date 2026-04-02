import Input from 'antd/lib/input'
import React, { memo } from 'react'
import useDebounceEffect from '../../Hooks/useDebounceEffect'
import AltInput from '../AltInput'
import { arabicRegex, InputValueType, TTextArea } from './types'

const { TextArea: TextAreaField } = Input

const TextArea = ({
  rows,
  onChange,
  onChangeAlt,
  onBlur,
  label,
  error,
  required,
  value,
  delay,
  hideLabel,
  altValue,
  altInput,
  ...props
}: TTextArea & typeof defaultProps) => {
  const [val, setValue] = useDebounceEffect((v: InputValueType) => onChange?.(props.name, v), value, delay)

  return (
    <div className="custom-input-box">
      {label && !hideLabel && (
        <label style={{ textAlign: 'left', width: 'fit-content' }}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      {altInput && <AltInput {...props} {...{ label, altValue, altInput, onChange: onChangeAlt }} />}

      <TextAreaField
        rows={rows}
        onChange={(e) => {
          if (!props.disabled && onChange) {
            setValue(e.target.value)
          }
        }}
        onBlur={() => onBlur?.(props.name, val)}
        value={val}
        dir={arabicRegex.test(val?.toString()) ? 'rtl' : 'ltr'}
        {...props}
      />

      {error && (
        <div style={{ fontSize: 10, color: 'red', textAlign: 'right' }}>
          {error.replace(props.name, label || props.placeholder || '')}
        </div>
      )}
    </div>
  )
}

const defaultProps = {
  rows: 1,
  delay: 500
}

TextArea.defaultProps = defaultProps

export default memo(TextArea)
