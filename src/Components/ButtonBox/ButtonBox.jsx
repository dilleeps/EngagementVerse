import { Button } from 'antd'
import React, { Component } from 'react'

class ButtonBox extends Component {
  componentDidMount() {
    this.props.refs?.(this)
  }

  componentWillUnmount() {
    this.props.refs?.(null)
  }

  onClick = () => {
    if (!this.props.loader) {
      this.props.onClick?.()
    }
  }

  render() {
    const { children, type, loader, style } = this.props

    return (
      <Button style={style} onClick={this.onClick} type={type || 'primary'} loading={loader}>
        {children}
      </Button>
    )
  }
}

export default ButtonBox
