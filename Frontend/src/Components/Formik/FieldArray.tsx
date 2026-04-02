import { Skeleton, Space } from 'antd'
import { getIn, useFormikContext } from 'formik'
import React, { FunctionComponent, memo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useMediaQuery from '../../Hooks/useMediaQuery'
import Button from '../Button'

type TFieldArray = {
  name: string
  editable?: boolean
  viewOnly?: boolean
  allowEmpty?: boolean
  children: FunctionComponent<
    {
      i: number
      setFieldValue: (field: string, value: unknown, shouldValidate?: boolean | undefined) => void
    } & TLineItem
  >
  defaultValues: string
  additionalValues: Record<string, unknown>
  delay?: number
  loaderCount?: number
  showAdd?: boolean
}

type TLineItem = {
  id: string
  new: boolean
}

function FieldArray({
  name,
  defaultValues,
  additionalValues,
  editable,
  viewOnly,
  allowEmpty,
  delay = 500,
  loaderCount = 3,
  showAdd,
  children: Comp
}: TFieldArray) {
  const { values, setFieldValue } = useFormikContext<{ [index: string]: [] }>()
  const { id } = useParams<{ id: string }>()
  const [mount, setMount] = useState(false)
  const sm = useMediaQuery('(max-width: 767px)')
  const md = useMediaQuery('(max-width: 991px)')

  const items = getIn(values, name) as []

  const addRow = () => {
    setFieldValue(name, [...items, defaultValues])
  }

  const removeRow = (index: number) => {
    setFieldValue(
      name,
      items.filter((_, i) => i !== index)
    )
  }

  useEffect(() => {
    setTimeout(() => {
      setMount(true)
    }, delay)
  }, [])

  const setUpdatedRowValue = (i: number, row: TLineItem, data: TLineItem) => {
    setFieldValue(`${name}[${i}]`, { ...row, ...data })
  }

  return mount ? (
    <>
      {items.map((item: TLineItem, i: number) => (
        <div className="list-field" key={i}>
          <div style={{ width: '100%' }}>
            <Comp
              {...{
                ...item,
                ...additionalValues,
                i,
                setFieldValue,
                setRowValue: (updatedValue: TLineItem) => setUpdatedRowValue(i, item, updatedValue)
              }}
            />
          </div>
          {(item.new || ((editable || !id) && (items.length > 1 || allowEmpty))) && (
            <div className="remove-column pl-2" style={{ position: 'absolute', right: -30 }}>
              <Button variant="primary" className="mt-4 btn-glow delete-field" onClick={() => removeRow(i)}>
                <i className="flaticon-delete-2 mr-0" />
              </Button>
            </div>
          )}
        </div>
      ))}
      {(showAdd || ((editable || !id) && !viewOnly)) && (
        <Button style={{ position: 'absolute', bottom: -18 }} success onClick={addRow}>
          <i className="flaticon-plus" /> Add
        </Button>
      )}
    </>
  ) : (
    <Space size="middle" className="field-array">
      {[...Array(sm ? 2 : md ? 3 : loaderCount)].map((item, i) => (
        <Skeleton.Input key={i} active />
      ))}
    </Space>
  )
}

export default memo(FieldArray)
