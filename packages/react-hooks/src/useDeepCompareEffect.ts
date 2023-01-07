import React from 'react'
import isEqual from './util/fast-deep-equal'

/**
 * Deep compare version of React.useEffect
 * @param fn
 * @param deps
 */
export function useDeepCompareEffect(fn: React.EffectCallback, deps: React.DependencyList): void {
  const signal = React.useRef<number>(0)
  const prevDeps = React.useRef<React.DependencyList>(deps)

  if (!isEqual(prevDeps.current, deps)) {
    signal.current += 1
  }
  prevDeps.current = deps

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(fn, [signal.current])
}
