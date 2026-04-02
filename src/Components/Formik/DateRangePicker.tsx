import { DatePicker } from 'antd'
import React, { memo } from 'react'
import { checkMoment } from '../../Util/Util'
import { TDateRangePicker } from './types'

const { RangePicker } = DatePicker

function DateRangePicker({
  label,
  error,
  required,
  onChange,
  onBlur,
  value,
  style,
  hideLabel,
  ...props
}: TDateRangePicker) {
  return (
    <div>
      {label && !hideLabel && (
        <label>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <RangePicker
        style={{
          width: '100%',
          ...style
        }}
        onChange={(val) => onChange?.(props.name, val)}
        onBlur={() => onBlur?.(props.name, value || null)}
        value={value ? [checkMoment(value[0]), checkMoment(value[1])] : null}
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

export default memo(DateRangePicker)
