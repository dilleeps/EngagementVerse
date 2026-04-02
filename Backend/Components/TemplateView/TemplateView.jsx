import { Col, Row } from 'antd'
import React, { useState } from 'react'
import { sanitize } from '../../Util/Util'
import '../Component.scss'

export default function TemplateView({ i, contents }) {
  const [scale, setScale] = useState(1)

  const onZoom = (type) => {
    const updatedScale = parseFloat(type === 'in' ? scale + 0.1 : scale - 0.1).toFixed(1)

    if (updatedScale > 0 && updatedScale < 2) {
      setScale(parseFloat(updatedScale))
    }
  }

  return (
    <Row>
      <Col xs={24} style={{ background: '#f3f3f3' }}>
        <div className="template-view-container">
          <div className="zoom-action">
            <div className="zoom-btn" onClick={() => onZoom('out')}>
              -
            </div>
            <div className="zoom-btn" onClick={() => onZoom('in')}>
              +
            </div>
          </div>
          <div>
            <div
              style={{
                transform: `scale(${scale})`,
                display: 'block'
              }}>
              {contents.map((v, i2) => (
                <div
                  key={`${i}-${i2}`}
                  style={{
                    margin: 15,
                    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                    transition: 0.3,
                    width: 'fit-content'
                  }}
                  {...sanitize(v)}
                />
              ))}
            </div>
          </div>
        </div>
      </Col>
    </Row>
  )
}
