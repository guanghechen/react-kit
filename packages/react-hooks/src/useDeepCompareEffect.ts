import { isEqual } from '@guanghechen/equal'
import type { DependencyList, EffectCallback } from 'react'
import { useEffect, useRef } from 'react'

/**
 * Deep compare version of React.useEffect
 * @param fn
 * @param deps
 */
export function useDeepCompareEffect(fn: EffectCallback, deps: DependencyList): void {
  const signal = useRef<number>(0)
  const prevDeps = useRef<DependencyList>(deps)

  if (!isEqual(prevDeps.current, deps)) signal.current += 1
  prevDeps.current = deps

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, [signal.current])
}
