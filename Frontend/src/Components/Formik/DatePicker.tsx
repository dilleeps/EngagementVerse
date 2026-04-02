import { DatePicker as DatePickerField } from 'antd'
import moment from 'moment'
import React, { memo } from 'react'
import { checkMoment } from '../../Util/Util'
import AltInput from '../AltInput'
import { TDatePicker } from './types'

function DatePicker({
  label,
  error,
  required,
  onChange,
  onChangeAlt,
  onBlur,
  value,
  style,
  hideLabel,
  altValue,
  altInput,
  ...props
}: TDatePicker) {
  return (
    <div>
      {label && !hideLabel && (
        <label style={{ textAlign: 'left', width: 'fit-content' }}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      {altInput && <AltInput {...props} {...{ label, altValue, altInput, onChange: onChangeAlt }} />}
      <DatePickerField
        style={{
          width: '100%',
          ...style
        }}
        onChange={(val) => onChange?.(props.name, val)}
        onBlur={() => onBlur?.(props.name, moment(value) || null)}
        value={checkMoment(value)}
        {...props}
      />
      {error && (
        <div style={{ fontSize: 10, color: 'red', textAlign: 'right' }}>
          {error.replace(props.name, label || '')}
        </div>
      )}
    </div>
  )
}

export default memo(DatePicker)
