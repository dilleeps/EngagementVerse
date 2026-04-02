import { debounce } from 'lodash'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

// Usage
// const [data, setData] = useDebounceEffect((value) => setValue(value), value.data, 1000)

export default function useDebounceEffect<S>(
  effect: (v: S) => void,
  _value: S,
  delay: number
): [S, Dispatch<SetStateAction<S>>] {
  const [value, setValue] = useState<S>(_value)

  useEffect(() => setValue(_value), [_value])

  const verify = useCallback(debounce(effect, delay), [])

  const onChange = (v: SetStateAction<S>): void => {
    verify(v as S)
    setValue(v)
  }

  return [value, onChange]
}
