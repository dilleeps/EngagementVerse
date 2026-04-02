import { Pagination } from 'antd'
import React, { Component } from 'react'

class PaginationBox extends Component {
  onChangePage = (page, perPage) => {
    this.props.onChangePage?.({ page, perPage })
  }

  render() {
    const { pageData, showSizeChanger } = this.props

    if (pageData) {
      return (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Pagination
            total={pageData.totalCount}
            showSizeChanger={showSizeChanger || true}
            onChange={this.onChangePage}
            defaultCurrent={1}
            current={pageData.page}
            {...this.props}
          />
        </div>
      )
    }

    return null
  }
}

export default PaginationBox
