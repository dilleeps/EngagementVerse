import { Select } from 'antd'
import React, { PureComponent } from 'react'

const { Option } = Select

class SelectBox extends PureComponent {
  constructor(props) {
    super(props)
    this.error = props.optional ? false : `${props.label || props.placeholder} required`
  }

  componentDidMount() {
    this.props.refs?.(this)

    if ((this.props.value && this.props.value !== '') || this.props.value === 0) {
      this.error = false
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isSubmit === false && this.props.isSubmit === true) {
      this.error = nextProps.optional ? false : `${nextProps.label || nextProps.placeholder} required`
    }

    if ((nextProps.value && nextProps.value !== '' && this.error) || nextProps.value === 0) {
      this.error = false
    }
  }

  componentWillUnmount() {
    this.props.refs?.(null)
  }

  onChange = (value) => {
    const { id, label, placeholder, optional, onChangeText } = this.props

    if ((value && value !== '') || value === 0) {
      onChangeText(value, id)

      if (this.error) {
        this.error = false
      }
    } else {
      if (!optional) {
        this.error = `${label || placeholder} required`
      }

      onChangeText(value, id)
    }
  }

  render() {
    const { label, options, value } = this.props
    const style = { width: '100%' }
    Object.assign(style, this.props.style || {})

    return (
      <div className="custom-select-box">
        {label && (
          <label>
            {label} <span className="required">{this.props.optional ? '' : '*'}</span>
          </label>
        )}
        <Select
          showSearch
          mode={this.props.mode}
          placeholder={this.props.placeholder || ''}
          onChange={this.onChange}
          style={style}
          defaultValue={
            value && value !== '' && value === 0
              ? this.props.mode === 'multiple'
                ? value
                : `${value}`
              : undefined
          }
          value={
            (value && value !== '') || value === 0
              ? this.props.mode === 'multiple'
                ? value
                : `${value}`
              : undefined
          }
          disabled={this.props.disabled}
          filterOption={(input, option) => option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
          {this.props.withNone && (
            <Option key="" value="">
              None
            </Option>
          )}
          {options !== undefined &&
            options.map((data) => (
              <Option key={data.label} value={`${data.value}`}>
                {data.label}
              </Option>
            ))}
        </Select>
        {this.error && this.props.isSubmit && (
          <div style={{ fontSize: 10, color: 'red', textAlign: 'right' }}>{this.error}</div>
        )}
      </div>
    )
  }
}

export default SelectBox
