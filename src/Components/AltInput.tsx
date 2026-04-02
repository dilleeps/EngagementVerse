import { Input as InputField, Modal } from 'antd'
import React, { useState } from 'react'
import { AltInputTypes, arabicRegex, InputValueType } from './Formik/types'

type TAltInput = {
  text?: string | Element
  name: string
  label?: string
  disabled?: boolean
  noAltDisabled?: boolean
  onChange?: (name: string, value: InputValueType) => void
} & AltInputTypes

export default function AltInput({
  text,
  name,
  altValue,
  onChange,
  label,
  disabled,
  noAltDisabled
}: TAltInput) {
  const [altText, setAltText] = useState(altValue || '')
  const [toggle, setToggle] = useState(false)

  const onOk = () => {
    onChange?.(`${name}Alt`, altText)
    setToggle(false)
  }

  const oncancel = () => {
    setAltText(altText)
    setToggle(false)
  }

  return (
    <>
      {text && <span style={{ paddingRight: 3 }}>{text}</span>}
      <i
        title="Add alternate text"
        className="flaticon-plus"
        style={{ float: 'right', color: altValue ? '#73cb57' : '#a3a3a3', cursor: 'pointer' }}
        onClick={() => {
          setToggle(true)
          setAltText(altValue || '')
        }}
      />
      <Modal
        visible={toggle}
        title={`Alternate ${label}`}
        onOk={onOk}
        onCancel={oncancel}
        maskClosable={false}
        destroyOnClose>
        <InputField
          disabled={!noAltDisabled ? disabled : false}
          value={altText}
          dir={arabicRegex.test(altText?.toString()) ? 'rtl' : 'ltr'}
          onChange={(e) => setAltText(e.target.value)}
        />
      </Modal>
    </>
  )
}
