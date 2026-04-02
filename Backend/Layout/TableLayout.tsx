import { Col, Row, Space, Tooltip } from 'antd'
import React, { ReactNode, useState } from 'react'
import Button from '../Components/Button'
import RadioGroup from '../Components/Formik/RadioGroup'
import ModalBox from '../Components/ModalBox/ModalBox'
import apiClient from '../Util/apiClient'
import { validateAccess } from '../Util/Util'

type TTableLayout = {
  title: string | ReactNode
  children: ReactNode
  rightSection?: ReactNode
  addButton?: {
    title: string
    onClick: () => void
    access: string
  }
  exportUrl?: string
  detailed?: boolean
  filterData?: Record<string, unknown>
}

export default function TableLayout({
  title,
  exportUrl = '',
  rightSection,
  addButton,
  filterData: params,
  detailed,
  children
}: TTableLayout) {
  const [exportType, setExportType] = useState('simple')
  const [visible, setVisible] = useState(false)

  const exportExcel = () => {
    apiClient
      .get(exportUrl, {
        params: {
          ...params,
          ...(detailed && { exportType })
        },
        responseType: 'blob'
      })
      .then(({ status, data, headers }) => {
        if (status === 200) {
          const a = document.createElement('a')
          a.href = window.URL.createObjectURL(data)
          a.download = JSON.parse(headers['content-disposition'].split('filename=')[1].split(';')[0])
          document.body.appendChild(a)
          a.click()
          a.remove()
          setVisible(false)
        }
      })
  }

  return (
    <div className="table-layout px-3">
      <ModalBox
        title="Export Excel"
        width={400}
        visible={visible}
        onOk={exportExcel}
        okText="Export"
        onCancel={() => setVisible(false)}
        destroyOnClose>
        <RadioGroup
          name="exportType"
          value={exportType}
          onChange={(n, v) => setExportType(v)}
          options={[
            { label: 'Simple', value: 'simple' },
            { label: 'Detailed', value: 'detailed' }
          ]}
        />
      </ModalBox>
      <Row justify="space-between" align="middle">
        <Col>{title && (typeof title === 'string' ? <h2 className="table-title">{title}</h2> : title)}</Col>
        <Col className="pt-1">
          <Space>
            {rightSection}
            {exportUrl && (
              <Tooltip title="Export Excel">
                <Button
                  variant="text"
                  className="d-inline-flex align-items-center p-0"
                  onClick={() => (detailed ? setVisible(true) : exportExcel())}>
                  <i
                    style={{ fontSize: '25px' }}
                    className="text-success flaticon-csv-file-format-extension no-margin d-inline-flex"
                  />
                </Button>
              </Tooltip>
            )}
          </Space>
        </Col>
      </Row>
      {addButton && (
        <div className="add-button">
          {typeof addButton === 'function'
            ? React.createElement(addButton)
            : validateAccess(addButton.access) && (
                <Button onClick={addButton.onClick} variant="primary" className="btn-block">
                  <i className="flaticon-plus" /> {addButton.title}
                </Button>
              )}
        </div>
      )}
      {children}
    </div>
  )
}
