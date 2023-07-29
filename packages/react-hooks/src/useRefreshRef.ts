import type { MutableRefObject } from 'react'
import { useRef } from 'react'

/**
 * Create a ref which always holds the latest value.
 * @param value
 * @returns
 */
export function useRefreshRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef<T>(value)
  ref.current = value
  return ref
}
