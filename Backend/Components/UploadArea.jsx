import { message, Upload } from 'antd'
import React from 'react'
import XLSX from 'xlsx'

class UploadArea extends React.Component {
  constructor() {
    super()
    this.state = {
      // invoices: [],
      // kind: '',
      // errorField: false,
      // loader: false
    }
  }

  onChangeText = (value, type) => {
    this.setState({ [type]: value })
  }

  onFileChange = ({ file }) => {
    if (file && file.originFileObj) {
      this.onUpload([file.originFileObj])
    }
  }

  onUpload = (acceptedFiles) => {
    const opts = {
      errors: {
        badfile() {
          alert('This file does not appear to be a valid Excel file.')
        },
        pending() {
          alert('Please wait until the current file is processed.')
        },
        large(len, cb) {
          if (
            window.confirm(
              `This file is ${len} bytes and may take a few moments.  Your browser may lock up during this process.  Shall we play?`
            )
          ) {
            cb()
          }
        },
        failed() {
          alert('We unfortunately dropped the ball here.')
        }
      },
      on: {
        sheet: (json) => {
          const [header = []] = json || []

          if (header.length > 0) {
            if (json.length > 1) {
              json.shift()
              this.props.onUpload(header, json)
            } else {
              message.error('No data to upload')
            }
          } else {
            message.error('Invalid File')
          }
        }
      }
    }
    const rABS =
      typeof FileReader !== 'undefined' && FileReader.prototype && FileReader.prototype.readAsBinaryString
    const [f] = acceptedFiles
    const reader = new FileReader()

    function fixdata(data) {
      let o = ''
      let l = 0
      const w = 10240

      for (; l < data.byteLength / w; ++l) {
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
      }

      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(o.length)))

      return o
    }

    function toJson(workbook) {
      const result = {}
      workbook.SheetNames.forEach((sheetName) => {
        try {
          const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })

          if (roa.length > 0) {
            result[sheetName] = roa
          }
        } catch (e) {
          // console.log(e);
        }
      })

      return result
    }

    function processWb(wb, sheetidx) {
      const sheet = wb.SheetNames[sheetidx || 0]
      const json = toJson(wb)[sheet]
      opts.on.sheet(json, wb.SheetNames)
    }

    const { sheetName } = this.props

    reader.onload = (e) => {
      let data = e.target.result
      let wb
      let arr
      const readtype = { type: rABS ? 'binary' : 'base64' }

      if (!rABS) {
        arr = fixdata(data)
        data = btoa(arr)
      }

      function doit() {
        try {
          wb = XLSX.read(data, readtype)
          const sheetIdx = wb.SheetNames.indexOf(sheetName)

          if (sheetIdx >= 0) {
            processWb(wb, sheetIdx)
          } else {
            message.error(`Invalid template! There is no sheet called ${sheetName} in this template`)
          }
        } catch (e) {
          //  console.log(e);
          opts.errors.failed(e)
        }
      }

      doit()
    }

    if (rABS) {
      reader.readAsBinaryString(f)
    } else {
      reader.readAsArrayBuffer(f)
    }
  }

  render() {
    return (
      <Upload
        previewFile
        fileList={[]}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        action={null}
        onChange={this.onFileChange}>
        <div className="file-upload-field">
          <div>
            <i className="flaticon-csv-file-format-extension" style={{ fontSize: 50 }} />
          </div>
          <div>{this.props.label || ''}</div>
        </div>
      </Upload>
    )
  }
}

export default UploadArea
