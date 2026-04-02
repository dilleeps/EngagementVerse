import { Button } from 'antd'
import React, { Component } from 'react'

class PageButtonBox extends Component {
  componentDidMount() {
    this.props.refs?.(this)
  }

  componentWillUnmount() {
    this.props.refs?.(null)
  }

  onClickNext = () => {
    if (this.props.enablePage !== 'loader') {
      const { dataSource, onNextPage } = this.props
      const lastRecord = dataSource.length > 0 ? dataSource[dataSource.length - 1] : false
      onNextPage(lastRecord.id)
    }
  }

  render() {
    if (this.props.enablePage) {
      const { pageLabel, type, loader, style } = this.props

      return (
        <Button style={style} onClick={this.onClickNext} type={type || 'primary'} loading={loader}>
          {this.props.enablePage === 'loader' ? (
            <>
              <i className="flaticon-reload" /> Loading..
            </>
          ) : (
            <>
              <i className="flaticon-download-5" /> {pageLabel}
            </>
          )}
        </Button>
      )
    }

    return null
  }
}

export default PageButtonBox
