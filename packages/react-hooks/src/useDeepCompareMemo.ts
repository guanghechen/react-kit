import { isEqual } from '@guanghechen/equal'
import type { DependencyList } from 'react'
import { useMemo, useRef } from 'react'

/**
 * Deep compare version of React.useMemo
 * @param fn
 * @param deps
 */
export function useDeepCompareMemo<T>(fn: () => T, deps: DependencyList): T {
  const signal = useRef<number>(0)
  const prevDeps = useRef<DependencyList>(deps)

  if (!isEqual(prevDeps.current, deps)) signal.current += 1
  prevDeps.current = deps

  return useMemo(fn, [signal.current])
}
