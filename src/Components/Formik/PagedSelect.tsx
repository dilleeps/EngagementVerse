import { Divider, Select as SelectField } from 'antd'
import _ from 'lodash'
import type { OptionData } from 'rc-select/lib/interface/index'
import { memo, useEffect, useState } from 'react'
import apiClient from '../../Util/apiClient'
import { convertSelectOptions } from '../../Util/Util'
import PaginationBox from '../Pagination/PaginationBox'
import type { TPagedSelect } from './types'

const { Option } = SelectField

function PagedSelect({
  label,
  error,
  required,
  withNone,
  style,
  onChange,
  onBlur,
  onSelect,
  endPoint,
  hideLabel,
  searchKey = '',
  optionLabel = 'name',
  optionValue = '_id',
  defaultOptions = [],
  params = {},
  onChangeAlt,
  ...props
}: TPagedSelect) {
  const [options, setOptions] = useState<OptionData[]>([])
  const [pageData, setPageData] = useState({})
  const [selectedFlag, setSelectedFlag] = useState(true)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const onOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLoading(true)
      getOptionData()
    }
  }

  useEffect(() => {
    if (selectedFlag && props.value && props.value !== '') {
      getSelectedOption(props.value, options)
      setSelectedFlag(false)
    }
  }, [props.value])

  const getOptionData = (obj = {}) => {
    if (endPoint) {
      const queryParams = { [searchKey || optionLabel]: search, ...obj, ...(params || {}) }
      apiClient.get(endPoint, { params: queryParams }).then(({ data }) => {
        if (data && data.result) {
          setOptions([
            ...defaultOptions,
            ...convertSelectOptions(data.result || [], optionLabel, optionValue)
          ])
          setPageData(data.pageData)
        }

        setLoading(false)
      })
    }
  }

  const getSelectedOption = (v: unknown, oldData: OptionData[]) => {
    if (endPoint) {
      apiClient
        .get(endPoint, { params: { [optionValue === 'id' ? '_id' : optionValue]: v } })
        .then(({ data }) => {
          if (data && data.result) {
            const optionData = _.uniqBy<OptionData>(
              convertSelectOptions([...oldData, ...data.result], optionLabel, optionValue),
              (v) => v[optionValue]
            )
            setOptions(optionData)
          }
        })
    }
  }

  const onChangePage = (pageData: Record<string, unknown>) => {
    getOptionData(pageData)
    setSelectedFlag(false)
  }

  const onSearch = (v: string) => {
    setSearch(v)
    getOptionData({ [searchKey || optionLabel]: v })
  }

  return (
    <div>
      {label && !hideLabel && (
        <label>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <SelectField
        showSearch
        style={{
          width: '100%',
          ...style
        }}
        filterOption={false}
        dropdownRender={(menu) => (
          <div>
            {menu}
            <Divider style={{ margin: '4px 0' }} />
            {!loading ? (
              <PaginationBox
                size="small"
                showSizeChanger={false}
                pageData={pageData}
                onChangePage={onChangePage}
              />
            ) : (
              <div style={{ textAlign: 'center', fontWeight: 600 }}>Loading..</div>
            )}
          </div>
        )}
        onDropdownVisibleChange={onOpen}
        onChange={(value = '') => {
          onChange?.(
            props.name,
            value,
            options?.find((item) => item.value === value)
          )
          setSelectedFlag(false)
        }}
        onBlur={() => onBlur?.(props.name, props.value || '')}
        onSelect={(v) =>
          onSelect?.(
            v,
            options?.find((item) => item.value === v)
          )
        }
        onSearch={onSearch}
        listHeight={320}
        {...props}>
        {withNone && (
          <Option key="" value="">
            {typeof withNone === 'string' ? withNone : 'None'}
          </Option>
        )}
        {options.map((data) => (
          <Option key={data?.value} value={data?.value}>
            {data?.label}
          </Option>
        ))}
      </SelectField>
      {error && (
        <div style={{ fontSize: 10, color: 'red', textAlign: 'right' }}>
          {error.replace(props.name, label || props.placeholder || '')}
        </div>
      )}
    </div>
  )
}

export default memo(PagedSelect)
