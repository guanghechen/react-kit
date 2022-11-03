import React from 'react'

/**
 * Use previous state.
 * @param value
 * @returns
 */
export function usePreviousState<T = unknown>(value: T): T {
  const ref = React.useRef<T>(value)
  React.useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
