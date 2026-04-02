import { getIn, useFormikContext } from 'formik'
import React, { memo, useState } from 'react'
import ModalBox from '../ModalBox/ModalBox'
import AddressFields from './AddressFields'

type TAddress = {
  addressType: string
  label: string
  disabled: boolean
  newForm: boolean
}

function Address({ addressType, label, disabled, newForm }: TAddress) {
  const { values, errors, touched } = useFormikContext<{ [index: string]: { [index: string]: string } }>()
  const [toggleAddress, setToggleAddress] = useState(false)

  const address = getIn(values, addressType)
  const error = getIn(errors, addressType)

  return (
    <>
      <ModalBox
        title="Update Address"
        visible={!!toggleAddress}
        onOk={() => setToggleAddress(false)}
        onCancel={() => setToggleAddress(false)}
        destroyOnClose>
        <AddressFields addressType={addressType} />
      </ModalBox>
      {(address?.street || address?.country || newForm) && (
        <div>
          <h2>
            {label}
            {Boolean(error) && <span className="required">*</span>}
            {!disabled && <i className="ml-2 flaticon-edit-1" onClick={() => setToggleAddress(true)} />}
          </h2>
          <h4>{address.street}</h4>
          <div>{address.city}</div>
          <div>{address.state}</div>
          <div>
            {address.country}
            {address.postalCode && ' -'} {address.postalCode}
          </div>
        </div>
      )}
      {error && getIn(touched, addressType) && (
        <div style={{ fontSize: 10, color: 'red' }}>{`${label} required`}</div>
      )}
    </>
  )
}

export default memo(Address)
