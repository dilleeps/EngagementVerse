import { Radio } from 'antd'
import React, { memo } from 'react'
import { TRadioGroup } from './types'

const { Group } = Radio

const RadioGroup = ({ options = [], error, label, required, onChange, ...props }: TRadioGroup) => (
  <div>
    <Group onChange={(e) => onChange?.(props.name, e.target.value)} {...props}>
      {options.map((data) => (
        <Radio key={data.value} value={data.value}>
          {data.label}
        </Radio>
      ))}
    </Group>
    {error && (
      <div style={{ fontSize: 10, color: 'red', textAlign: 'right' }}>
        {error.replace(props.name, label || '')}
      </div>
    )}
  </div>
)

export default memo(RadioGroup)
