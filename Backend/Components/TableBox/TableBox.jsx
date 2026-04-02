import { Table } from 'antd'
import clsx from 'clsx'
import _ from 'lodash'
import { Component } from 'react'
import PageButtonBox from '../Pagination/PageButtonBox'
import PaginationBox from '../Pagination/PaginationBox'
import './TableBox.scss'

class TableBox extends Component {
  onSelectChange = (selected) => {
    let selectedRows = [...(this.props.selectedRows || [])]
    const check = selectedRows.find((val) => val.id === selected.id)

    if (check) {
      selectedRows = selectedRows.filter((val) => val.id !== selected.id)
    } else {
      selectedRows.push(selected)
    }

    this.props.onSelect(selectedRows)
  }

  onSelectAll = (selected, changeRows, rows) => {
    const selectedRowKeys = rows.map((v) => v.id)
    let selectedRows = [...(this.props.selectedRows || [])]

    if (selected) {
      selectedRows = [...selectedRows, ...this.props.dataSource]
      selectedRows = _.uniqBy(selectedRows, (v) => v.id)
    } else {
      selectedRows = _.remove(selectedRows, (v) => !selectedRowKeys.includes(v.id))
    }

    this.props.onSelect(selectedRows)
  }

  render() {
    const { dataSource, onSelect, pageLabel, onNextPage, enablePage, className } = this.props
    const rowSelection = {
      selectedRowKeys:
        this.props.selectedRows?.length > 0 ? this.props.selectedRows.map((val) => val.id) : [],
      onSelect: this.onSelectChange,
      onSelectAll: this.onSelectAll,
      preserveSelectedRowKeys: true
    }

    return (
      <div className={clsx('custom-background', className)}>
        <div className="custom-table">
          <Table
            rowSelection={onSelect ? rowSelection : false}
            pagination={false}
            {...this.props}
            columns={this.props.columns?.filter((v) => !v.dontShow)}
            dataSource={
              dataSource &&
              dataSource.length > 0 &&
              dataSource.map((data) => {
                data.key = data.id

                return data
              })
            }
            tableLayout="auto"
            scroll={{ x: '100%' }}
          />
          {onNextPage && (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <PageButtonBox
                pageLabel={pageLabel}
                enablePage={enablePage}
                dataSource={dataSource}
                onNextPage={onNextPage}
              />
            </div>
          )}
        </div>

        {this.props.pageData && (
          <PaginationBox
            pageData={dataSource.length > 0 ? this.props.pageData : false}
            onChangePage={this.props.onChangePage}
          />
        )}
      </div>
    )
  }
}

export default TableBox
