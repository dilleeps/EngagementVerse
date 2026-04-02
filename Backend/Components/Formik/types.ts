import { AutoCompleteProps } from 'antd/lib/auto-complete'
import { CheckboxProps } from 'antd/lib/checkbox'
import { DatePickerProps, RangePickerProps } from 'antd/lib/date-picker'
import { InputProps, TextAreaProps } from 'antd/lib/input'
import { RadioGroupProps } from 'antd/lib/radio'
import { SelectProps, SelectValue } from 'antd/lib/select'
import { Moment } from 'moment'
import { RangeValue } from 'rc-picker/lib/interface'
import { OptionData, OptionsType } from 'rc-select/lib/interface/index'

export type InputValueType = string | ReadonlyArray<string> | number

export type AltInputTypes = {
  altValue?: InputValueType
  altInput?: boolean
}

type BaseFormikTypes = {
  name: string
  label?: string
  error?: string
  required?: boolean
  hideLabel?: boolean
  onChangeAlt?: (name: string, value: InputValueType) => void
} & AltInputTypes

export type TInput = {
  placeholder?: string
  max?: number
  min?: number
  prefix?: string
  suffix?: string
  value: InputValueType
  delay: number
  onChange?: (name: string, value: InputValueType) => void
  onBlur?: (name: string, value: InputValueType) => void
} & BaseFormikTypes &
  Omit<InputProps, 'onChange' | 'onBlur' | 'value'>

export type TInputChip = {
  placeholder?: string
  max?: number
  min?: number
  prefix?: string
  suffix?: string
  value: Array<string>
  delay: number
  emailValidation?: boolean
  onChange?: (name: string, value: InputValueType) => void
  onBlur?: (name: string, value: InputValueType) => void
} & BaseFormikTypes &
  Omit<InputProps, 'onChange' | 'onBlur' | 'value'>

export type TTextArea = {
  placeholder?: string
  value: InputValueType
  delay: number
  onChange?: (name: string, value: InputValueType) => void
  onBlur?: (name: string, value: InputValueType) => void
} & BaseFormikTypes &
  Omit<TextAreaProps, 'onChange' | 'onBlur' | 'type' | 'value'>

interface ISelect<VT> extends Omit<SelectProps<VT>, 'onChange' | 'onBlur' | 'onSelect'> {
  placeholder?: string
  withNone?: boolean
  options?: OptionData[]
  endPoint?: string
  optionLabel?: string
  searchKey?: string
  defaultOptions?: OptionData[]
  optionValue?: string
  onChange?: (name: string, value: SelectValue, option?: OptionsType[number] | OptionsType) => void
  onBlur?: (name: string, value: SelectValue) => void
  onSelect?: (value: SelectValue, option?: OptionsType[number]) => void
  params?: Record<string, unknown>
}

export type TSelect = ISelect<SelectValue> & BaseFormikTypes

export type TPagedSelect = ISelect<SelectValue> & Omit<BaseFormikTypes, keyof AltInputTypes>

export type TAutoComplete = {
  placeholder?: string
  textArea?: boolean
  rows?: number
  delay: number
  endPoint?: string
  params?: Record<string, unknown>
  optionLabel?: string
  optionValue?: string
  queryName?: string
  onChange?: (name: string, value: InputValueType, option?: OptionsType[number] | OptionsType) => void
  onBlur?: (name: string, value: InputValueType) => void
} & BaseFormikTypes &
  Omit<AutoCompleteProps, 'onChange' | 'onBlur'>

export type TDatePicker = {
  onChange?: (name: string, value: Moment | null) => void
  onBlur?: (name: string, value: Moment | null) => void
} & BaseFormikTypes &
  Omit<DatePickerProps, 'onChange' | 'onBlur'>

export type TDateRangePicker = {
  onChange?: (name: string, value: RangeValue<Moment>) => void
  onBlur?: (name: string, value: RangeValue<Moment>) => void
} & BaseFormikTypes &
  Omit<RangePickerProps, 'onChange' | 'onBlur'>

export type TCheckbox = {
  value: boolean
  onChange?: (name: string, value: boolean) => void
} & BaseFormikTypes &
  Omit<CheckboxProps, 'onChange'>

export type TRichText = {
  name: string
  value: string
  onChange?: (name: string, value: string) => void
} & BaseFormikTypes

export type TRadioGroup = {
  value: string
  options: Array<{ label: string; value: string }>
  onChange?: (name: string, value: string) => void
} & BaseFormikTypes &
  Omit<RadioGroupProps, 'onChange'>

export const arabicRegex = /[\u0600-\u06FF]/
