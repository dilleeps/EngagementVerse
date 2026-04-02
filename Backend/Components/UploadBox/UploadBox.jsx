import { InputNumber, Upload } from 'antd'
import React from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import apiClient from '../../Util/apiClient'
import { getImageUrl } from '../../Util/Util'
import ModalBox from '../ModalBox/ModalBox'
import ModalBoxFooter from '../ModalBox/ModalBoxFooter'

const minZoom = 0.2

export default class UploadBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      document: false,
      documentStr: false,
      crop: { x: 0, y: 0 },
      zoom: 1,
      croppedAreaPixels: null,
      cropSize: { width: props.width || 300, height: props.height || 100 }
    }
  }

  onFileChange = async (file) => {
    const document = file.file.originFileObj
    const documentStr = await this.convertoBase64(document)
    this.setState({ document, documentStr })
  }

  convertoBase64 = (slide) =>
    new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(slide)

      reader.onloadend = () => {
        resolve(reader.result)
      }
    })

  onUpload = async () => {
    const { documentStr, croppedAreaPixels } = this.state
    const croppedImage = await getCroppedImg(documentStr, croppedAreaPixels, 0)

    if (this.props.base64) {
      this.props.onUpload?.((await this.convertoBase64(croppedImage)) || '', this.props.id)
      this.setState({ document: false, documentStr: false })
    } else {
      const uploadData = new FormData()
      uploadData.append('document', croppedImage, this.state.document.name)
      const headers = {
        Accept: 'application/x-www-form-urlencoded',
        'Content-Type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache'
      }
      apiClient
        .post(this.props.uploadUrl || 'companies/uploadTempDocuments', uploadData, { headers })
        .then(({ data }) => {
          if (data && data.result) {
            this.props.onUpload?.(data.result[0]?.path || '', this.props.id)
            this.setState({ document: false, documentStr: false })
          }
        })
    }
  }

  onCropComplete = (croppedArea, croppedAreaPixels) => {
    this.setState({ croppedAreaPixels })
  }

  onChangeCrop = (value, type) => {
    if (value > 300) {
      this.setState({ cropSize: this.state.cropSize })
    } else {
      const cropSize = { ...this.state.cropSize, [type]: value }
      this.setState({ cropSize })
    }
  }

  render() {
    const { documentStr, crop, zoom, cropSize } = this.state
    const { height, label, value, direct, showResizer } = this.props

    return (
      <>
        <Upload
          previewFile
          fileList={[]}
          accept="image/jpeg, image/png"
          action={null}
          onChange={this.onFileChange}>
          {value && value !== '' ? (
            <img
              style={{ maxHeight: height, width: '100%' }}
              alt="upload"
              src={direct ? value : getImageUrl(value)}
            />
          ) : (
            <div className="file-upload-field">
              <div>{label || 'Upload'}</div>
            </div>
          )}
        </Upload>
        <ModalBox
          title="Upload"
          visible={!!documentStr}
          footer={null}
          onCancel={() => this.setState({ document: false, documentStr: false })}
          destroyOnClose>
          <div style={{ minHeight: 350, position: 'relative' }}>
            {!!documentStr && (
              <Cropper
                restrictPosition={false}
                minZoom={minZoom}
                image={documentStr}
                crop={crop}
                cropSize={cropSize}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={(crop) => this.setState({ crop })}
                onCropComplete={this.onCropComplete}
                onZoomChange={(zoom) => this.setState({ zoom })}
              />
            )}
          </div>
          {showResizer && (
            <div style={{ position: 'absolute', bottom: 15 }}>
              <InputNumber
                style={{ width: 100 }}
                min={1}
                max={300}
                value={this.state.cropSize.height}
                onChange={(val) => this.onChangeCrop(val, 'height')}
              />
              <InputNumber
                style={{ width: 100 }}
                min={1}
                max={300}
                value={this.state.cropSize.width}
                onChange={(val) => this.onChangeCrop(val, 'width')}
              />
            </div>
          )}
          <ModalBoxFooter
            onOk={this.onUpload}
            okText="Upload"
            onCancel={() => this.setState({ document: false, documentStr: false })}
          />
        </ModalBox>
      </>
    )
  }
}
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // As Base64 string
  // return canvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file)
    }, 'image/jpeg')
  })
}
