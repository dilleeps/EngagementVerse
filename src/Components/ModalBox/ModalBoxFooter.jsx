import { Button } from 'antd'
import React, { PureComponent } from 'react'

class ModalBoxFooter extends PureComponent {
  render() {
    const { onOk, okText, onCancel, cancelText, onOk1, okText1, loader } = this.props

    return (
      <div
        className="ant-modal-footer"
        style={{ width: '100%', marginTop: 10, marginBottom: -20, paddingRight: 0 }}>
        <Button disabled={loader} onClick={onCancel} type="secondary">
          {cancelText || 'Cancel'}
        </Button>
        <Button disabled={loader} onClick={onOk} type="primary" loading={loader}>
          {okText || 'Ok'}
        </Button>
        {onOk1 && (
          <Button disabled={loader} onClick={onOk1} type="primary" loading={loader}>
            {okText1 || 'Ok'}
          </Button>
        )}
      </div>
    )
  }
}

export default ModalBoxFooter
