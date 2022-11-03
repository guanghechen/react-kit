import React from 'react'

/**
 * Create a ref which always holds the latest value.
 * @param value
 * @returns
 */
export function useRefreshRef<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef<T>(value)
  ref.current = value
  return ref
}
