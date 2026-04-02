import { Col, Row } from 'antd'
import React, { memo } from 'react'
import Field from '../Formik/Field'

function AddressFields({ addressType }: { addressType: string }) {
  return (
    <Row gutter={[10, 5]}>
      <Col xs={24}>
        <div className="form-field">
          <Field name={`${addressType}.street`} label="Street" altInput />
        </div>
      </Col>
      <Col xs={24}>
        <div className="form-field">
          <Field name={`${addressType}.city`} label="City" altInput />
        </div>
      </Col>
      <Col xs={24}>
        <div className="form-field">
          <Field name={`${addressType}.state`} label="State" altInput />
        </div>
      </Col>
      <Col xs={24}>
        <div className="form-field">
          <Field name={`${addressType}.country`} label="Country" altInput />
        </div>
      </Col>
      <Col xs={24}>
        <div className="form-field">
          <Field name={`${addressType}.postalCode`} label="Postal Code" altInput />
        </div>
      </Col>
    </Row>
  )
}

export default memo(AddressFields)
