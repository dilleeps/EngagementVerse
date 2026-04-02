import { AutoComplete, Input } from 'antd'
import React, { Component } from 'react'

const { TextArea } = Input

class AutoCompleteBox extends Component {
  constructor(props) {
    super(props)
    this.error = props.optional ? false : `${props.label || props.placeholder} required`
  }

  componentDidMount() {
    this.props.refs?.(this)

    if (this.props.value && this.props.value !== '') {
      this.error = false
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isSubmit === false && this.props.isSubmit === true) {
      this.error = nextProps.optional ? false : `${nextProps.label || nextProps.placeholder} required`
    }

    if (nextProps.value && nextProps.value !== '' && this.error) {
      this.error = false
    }
  }

  componentWillUnmount() {
    this.props.refs?.(null)
  }

  onChange = (value) => {
    const { id, label, placeholder, optional, onChangeText } = this.props

    if (value && value !== '') {
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

  onBlur = (e) => {
    const { value } = e.target
    const { id, label, placeholder, optional, onBlur } = this.props

    if (value && value !== '') {
      onBlur?.(value, id)

      if (this.error) {
        this.error = false
      }
    } else {
      if (!optional) {
        this.error = `${label || placeholder} required`
      }

      onBlur?.(value, id)
    }
  }

  onSelect = (value) => {
    const { id, label, placeholder, optional, onSelect } = this.props

    if (value && value !== '') {
      onSelect?.(value, id)

      if (this.error) {
        this.error = false
      }
    } else {
      if (!optional) {
        this.error = `${label || placeholder} required`
      }

      onSelect?.(value, id)
    }
  }

  render() {
    const { label, options, value } = this.props
    const style = { width: '100%' }
    Object.assign(style, this.props.style || {})

    return (
      <div>
        {label && (
          <label>
            {label} <span className="required">{this.props.optional ? '' : '*'}</span>
          </label>
        )}
        <AutoComplete
          style={style}
          value={value}
          options={options}
          onChange={this.onChange}
          placeholder={this.props.placeholder || ''}
          disabled={this.props.disabled}
          onBlur={this.onBlur}
          onSelect={this.onSelect}
          filterOption={
            this.props.filterOption
              ? this.props.filterOption
              : (inputValue, option) => !option.value.toUpperCase().indexOf(inputValue.toUpperCase()) >= 0
          }>
          {this.props.textArea && <TextArea rows={this.props.rows || 2} />}
        </AutoComplete>
        {this.error && this.props.isSubmit && (
          <div style={{ fontSize: 10, color: 'red', textAlign: 'right' }}>{this.error}</div>
        )}
      </div>
    )
  }
}

export default AutoCompleteBox
