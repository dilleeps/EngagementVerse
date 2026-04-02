import { message, Upload } from 'antd'
import React, { memo, useEffect, useState } from 'react'
import excelIcon from '../assets/images/excel.png'
import imageIcon from '../assets/images/image.png'
import pdfIcon from '../assets/images/pdf.png'
import apiClient from '../Util/apiClient'
import { getDocPath } from '../Util/Util'
import './Component.scss'

const headers = {
  Accept: 'application/x-www-form-urlencoded',
  'Content-Type': 'application/x-www-form-urlencoded',
  'cache-control': 'no-cache'
}

const formats = {
  excel: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
  pdf: 'application/pdf',
  image: 'image/png, image/jpeg'
}

const fileIcons = {
  excel: 'flaticon-csv-file-format-extension',
  pdf: 'flaticon-pdf',
  image: 'flaticon-image-gallery'
}

const displayIcons = {
  'application/pdf': pdfIcon,
  'image/png': imageIcon,
  'image/jpeg': imageIcon,
  'application/vnd.ms-excel': excelIcon,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': excelIcon,
  '.csv': excelIcon
}

function Attachments({
  title = '',
  name = '',
  description = '',
  acceptFile = ['image'],
  endPoint = 'companies/uploadTempDocuments',
  onUpload,
  value = [],
  disabled,
  readOnly
}) {
  const [attachments, setAttachments] = useState(value)
  const [prevent, setPrevent] = useState(true)

  useEffect(() => {
    if (value.length > 0) {
      setAttachments(value)
    }
  }, [value])

  const onFileChange = async ({ file }) => {
    if (prevent && file && file.originFileObj) {
      const fileSize = file.size / 1024 / 1024

      if (attachments.length >= 3 || fileSize > 5) {
        message.error(attachments.length >= 3 ? 'Number of files exceeds 3' : 'File size exceeds 5 mb')

        return true
      }

      const uploadData = new FormData()
      uploadData.append('document', file.originFileObj)
      apiClient.post(endPoint, uploadData, { headers }).then(({ data }) => {
        if (data && data.result) {
          setAttachments([...attachments, data.result[0]])
          onUpload?.(name, [...attachments, data.result[0]])
        }

        setPrevent(true)
      })
      setPrevent(false)
    }
  }

  const onClear = (file) => {
    const files = attachments.filter((v) => v.name !== file.name)
    setAttachments(files)
    onUpload?.(name, files)
  }

  const onDownload = (v) => {
    window.open(getDocPath(v.path), '_blank').focus()
  }

  const accept = acceptFile.map((v) => formats[v] || '').join(', ')

  return (
    <div className="attachments-area">
      {!readOnly && (
        <Upload previewFile fileList={[]} accept={accept} onChange={onFileChange} disabled={disabled}>
          <div className="attachments-drop-area">
            <div>
              {acceptFile.map((v, i) => (
                <i key={i} className={fileIcons[v]} style={{ fontSize: 30, margin: 10 }} />
              ))}
            </div>
            <b>{title}</b>
            <div>{description}</div>
          </div>
        </Upload>
      )}
      <div className="attachments-files">
        {attachments.map((v, i) => (
          <div key={i} className="file-content">
            {!disabled && (
              <div className="clear-icon" onClick={() => onClear(v)}>
                <i className="flaticon-delete" />
              </div>
            )}
            <img alt="file" title={v.name} src={displayIcons[v.type]} onClick={() => onDownload(v)} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(Attachments)
