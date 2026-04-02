import { FunctionComponent, memo } from 'react'
import ReactQuill from 'react-quill'
import useDebounceEffect from '../../Hooks/useDebounceEffect'
import type { TRichText } from './types'

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],

    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],

    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }],
    [{ align: [] }],

    ['clean']
  ]
}

const RichText: FunctionComponent<TRichText> = ({
  value,
  label,
  hideLabel,
  required,
  onChange,
  error,
  ...props
}) => {
  const [val, setValue] = useDebounceEffect((v: string) => onChange?.(props.name, v), value, 500)

  return (
    <div>
      {label && !hideLabel && (
        <label style={{ textAlign: 'left', width: 'fit-content' }}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <ReactQuill value={val || '<p></p>'} modules={modules} onChange={(text) => setValue(text)} />
      {error && (
        <div style={{ fontSize: 10, color: 'red', textAlign: 'right' }}>
          {error.replace(props.name, label || '')}
        </div>
      )}
    </div>
  )
}

export default memo(RichText)
