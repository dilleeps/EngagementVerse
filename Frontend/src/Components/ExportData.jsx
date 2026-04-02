import { memo, useEffect, useRef, useState } from 'react'
import { CheckCircleFilled, DownloadOutlined, FileExcelOutlined, LoadingOutlined } from '@ant-design/icons'
import { Col, Row, Spin, message } from 'antd'
import Button from './Button'
import ModalBox from './ModalBox/ModalBox'
import Input from './Formik/Input'
import apiClient from '../Util/apiClient'
import { GET_DATA, formatDate } from '../Util/Util'
import TableBox from './TableBox/TableBox'
import AppConfig from '../config'

const { API_URL } = AppConfig

function ExportData({ endPoint, queryFrom }) {
  const [toggle, setToggle] = useState(false)
  const [fileName, setFileName] = useState('')
  const [dataExports, setDataExports] = useState([])

  const [processing, setProcessing] = useState(false)
  const interval = useRef()

  const onExport = () => {
    if (!fileName) {
      return message.error('Please enter file name')
    }

    apiClient.post(endPoint, { ...GET_DATA(queryFrom), name: fileName }).then(({ data }) => {
      if (data?.result) {
        message.success('File processing')
        setFileName('')
        getData()
      }
    })
  }

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current)
    }

    if (processing) {
      interval.current = setInterval(
        () => {
          getData()
        },
        toggle ? 3000 : 60000
      )
    }
  }, [processing, toggle])

  const getData = () => {
    apiClient.get('data-exports/list').then(({ data }) => {
      if (data?.result) {
        setDataExports(data.result)

        if (data.result.find((v) => v.status === 'Processing')) {
          setProcessing(true)
        } else {
          setProcessing(false)
        }
      }
    })
  }

  useEffect(() => {
    getData()
  }, [toggle])

  const onDowload = (r) => {
    if (r.source === 'S3') {
      apiClient.get(`data-exports/download-link/${r.id}`).then(({ data }) => {
        if (data?.result) {
          const dowloadUrl = data.result
          const a = document.createElement('a')
          a.href = dowloadUrl
          a.click()
        }
      })
    } else {
      const dowloadUrl = `${API_URL}/${r.path}`
      const a = document.createElement('a')
      a.href = dowloadUrl
      // a.download = r.name
      a.click()
    }
  }

  return (
    <div>
      <Button
        variant="primary"
        onClick={() => {
          setToggle(true)
        }}>
        {processing ? <LoadingOutlined spin /> : <FileExcelOutlined />} Export
      </Button>
      <ModalBox
        title="Export"
        visible={!!toggle}
        onCancel={() => setToggle(false)}
        destroyOnClose
        footer={false}>
        <div>
          <Row gutter={[10]} justify="space-between">
            <Col lg={20}>
              <Input
                name="name"
                placeholder="Enter name of the file"
                value={fileName}
                onChange={(n, v) => setFileName(v)}
              />
            </Col>
            <Col>
              <Button variant="primary" onClick={onExport}>
                Export
              </Button>
            </Col>
          </Row>

          {dataExports.length > 0 && (
            <div className="mt-4">
              <TableBox
                columns={[
                  { title: 'Name', dataIndex: 'name' },
                  {
                    title: 'Record Processed',
                    dataIndex: 'recordProcessed',
                    render: (v) => v || 0
                  },
                  {
                    title: 'Valid Till',
                    dataIndex: 'expiredDate',
                    render: (v) => formatDate(v, true)
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    render: (v) => (v === 'Processing' ? <Spin /> : <CheckCircleFilled />)
                  },
                  {
                    title: '',
                    dataIndex: 'status',
                    render: (v, r) =>
                      v === 'Processed' ? <DownloadOutlined onClick={() => onDowload(r)} /> : null
                  }
                ]}
                dataSource={dataExports}
              />
            </div>
          )}
        </div>
      </ModalBox>
    </div>
  )
}

export default memo(ExportData)
