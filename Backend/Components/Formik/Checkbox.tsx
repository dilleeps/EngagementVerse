import AntdCheckbox from 'antd/lib/checkbox'
import React, { memo } from 'react'
import { TCheckbox } from './types'

const Checkbox = ({ value, label, onChange, error, required, ...props }: TCheckbox) => (
  <div>
    <AntdCheckbox checked={value} onChange={(e) => onChange?.(props.name, e.target.checked)} {...props}>
      {label} {required && <span className="required">*</span>}
    </AntdCheckbox>
    {error && (
      <div style={{ fontSize: 10, color: 'red', textAlign: 'right' }}>
        {error.replace(props.name, label || '')}
      </div>
    )}
  </div>
)

export default memo(Checkbox)
