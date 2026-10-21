import { useState } from 'react'

interface PreviousValue<T> {
  current: T
  previous: T | undefined
}

export default function usePrevious<T>(value: T): T | undefined {
  const [state, setState] = useState<PreviousValue<T>>({
    current: value,
    previous: undefined,
  })

  if (!Object.is(value, state.current)) {
    setState({ current: value, previous: state.current })
  }

  return state.previous
}
