import { isEqual } from '@guanghechen/equal'
import type { DependencyList } from 'react'
import { useCallback, useRef } from 'react'

/**
 * Deep compare version of React.useCallback
 * @param fn
 * @param deps
 */
export function useDeepCompareCallback<T extends (...args: any[]) => any>(
  fn: T,
  deps: DependencyList,
): T {
  const signal = useRef<number>(0)
  const prevDeps = useRef<React.DependencyList>(deps)

  if (!isEqual(prevDeps.current, deps)) signal.current += 1
  prevDeps.current = deps

  return useCallback(fn, [signal.current])
}
