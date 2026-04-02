import { AutoComplete as AutoCompleteField, Input } from 'antd'
import { getIn } from 'formik'
import React, { FunctionComponent, memo, useState } from 'react'
import useDebounceEffect from '../../Hooks/useDebounceEffect'
import useDidUpdateEffect from '../../Hooks/useDidUpdateEffect'
import apiClient from '../../Util/apiClient'
import { convertSelectOptions, removeEmptyKeys } from '../../Util/Util'
import AltInput from '../AltInput'
import { arabicRegex, TAutoComplete } from './types'

const AutoComplete: FunctionComponent<TAutoComplete> = ({
  label,
  error,
  required,
  onChange,
  onChangeAlt,
  onSearch,
  onBlur,
  textArea,
  rows,
  style,
  value,
  delay,
  hideLabel,
  altValue,
  altInput,
  endPoint,
  params,
  optionLabel = 'name',
  optionValue = 'id',
  queryName,
  ...props
}) => {
  const [val, setValue] = useDebounceEffect((v: string | undefined) => onSearch?.(v || ''), value, delay)
  const [internalOptions, setInternalOptions] = useState([])

  useDidUpdateEffect(() => {
    if (endPoint) {
      onSearchFilter(val || '')
    }
  }, [val, params])

  const onSearchFilter = (v: string) => {
    if (v) {
      const updatedParams = removeEmptyKeys(params || {})
      const queryParams = { ...updatedParams, [queryName || props.name]: v }
      apiClient.get(endPoint || '', { params: queryParams }).then(({ data }) => {
        if (data && data.result) {
          setInternalOptions(convertSelectOptions(data.result || [], optionLabel, optionValue))
        }
      })
    } else {
      setInternalOptions([])
    }
  }

  const options = props.options || internalOptions

  const changedValue =
    getIn(
      options?.find((item) => item.value === val),
      'label',
      ''
    ) || val

  return (
    <div className="custom-input-box">
      {label && !hideLabel && (
        <label style={{ textAlign: 'left', width: 'fit-content' }}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}

      {altInput && <AltInput {...props} {...{ label, altValue, altInput, onChange: onChangeAlt }} />}

      <AutoCompleteField
        style={{
          width: '100%',
          ...style
        }}
        onSearch={setValue}
        onChange={(v) => {
          if (!v) {
            onChange?.(props.name, v)
          }
        }}
        onSelect={(v, option) => onChange?.(props.name, v, option)}
        filterOption={(input, option) =>
          String(option?.label)?.toLowerCase?.().indexOf(input.toLowerCase()) >= 0
        }
        onBlur={() => onBlur?.(props.name, val || '')}
        value={changedValue}
        options={options}
        {...props}>
        {textArea ? (
          <Input.TextArea rows={rows} dir={arabicRegex.test(changedValue?.toString()) ? 'rtl' : 'ltr'} />
        ) : (
          <Input dir={arabicRegex.test(changedValue?.toString()) ? 'rtl' : 'ltr'} />
        )}
      </AutoCompleteField>
      {error && (
        <div style={{ fontSize: 10, color: 'red', textAlign: 'right' }}>
          {error.replace(props.name, label || props.placeholder || '')}
        </div>
      )}
    </div>
  )
}

export default memo(AutoComplete)
