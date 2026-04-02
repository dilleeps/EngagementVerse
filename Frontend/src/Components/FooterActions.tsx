import { Col, Row } from 'antd'
import Button, { TButton } from './Button'
import './Component.scss'

type Actions = {
  dontShow?: boolean
  label: string
  disabled?: boolean
} & TButton

type TFooterActions = {
  leftActions: Actions[]
  centerActions: Actions[]
  rightActions: Actions[]
}

export default function FooterActions({
  leftActions = [],
  centerActions = [],
  rightActions = []
}: TFooterActions) {
  return (
    <Row className="footer-actions">
      <Col xs={24} sm={8} md={8} lg={8} className="left-actions">
        {leftActions.map(
          (v, i) =>
            !v.dontShow && (
              <div className="action-content" key={i}>
                <Button type={v.type} variant={v.variant} disabled={v.disabled} onClick={v.onClick}>
                  <i className={v.prefix} /> {v.label}
                </Button>
              </div>
            )
        )}
      </Col>
      <Col xs={12} sm={8} md={8} lg={8} className="center-actions">
        {centerActions.map(
          (v, i) =>
            !v.dontShow && (
              <div className="action-content" key={i}>
                <Button
                  type={v.type}
                  variant={v.variant || 'primary'}
                  disabled={v.disabled}
                  onClick={v.onClick}>
                  <i className={v.prefix} /> {v.label}
                </Button>
              </div>
            )
        )}
      </Col>
      <Col xs={12} sm={8} md={8} lg={8} className="right-actions">
        {rightActions.map(
          (v, i) =>
            !v.dontShow && (
              <div className="action-content" key={i}>
                <Button type={v.type} variant={v.variant} disabled={v.disabled} onClick={v.onClick}>
                  <i className={v.prefix} /> {v.label}
                </Button>
              </div>
            )
        )}
      </Col>
    </Row>
  )
}
