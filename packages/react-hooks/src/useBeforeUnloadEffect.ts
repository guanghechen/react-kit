import type { DependencyList } from 'react'
import { useLayoutEffect } from 'react'
import { useDeepCompareCallback } from './useDeepCompareCallback'
import { useEventCallback } from './useEventCallback'
import { useRefreshRef } from './useRefreshRef'

export function useBeforeUnloadEffect(
  fn: (event: BeforeUnloadEvent) => void,
  deps: DependencyList,
): void {
  const beforeunload = useDeepCompareCallback(fn, deps)

  useLayoutEffect(() => {
    window.addEventListener('beforeunload', beforeunload)
    return () => window.removeEventListener('beforeunload', beforeunload)
  }, [beforeunload])
}

export function useBeforeUnloadAsyncEffect(
  fn: (event: BeforeUnloadEvent) => Promise<void>,
  preventDefault = true,
): void {
  const preventDefaultRef = useRefreshRef<boolean>(preventDefault)

  const beforeunload = useEventCallback(async (event: BeforeUnloadEvent) => {
    if (preventDefaultRef.current === false) {
      return fn(event)
    }

    event.preventDefault()
    try {
      await fn(event)
    } finally {
      // The browser will handle the page unload after the event handler finishes execution
      // You can't directly control the timing or cancel the unload process
      // The returned value is ignored in most modern browsers
      // eslint-disable-next-line no-param-reassign
      delete event.returnValue
    }
  })

  useLayoutEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    window.addEventListener('beforeunload', beforeunload)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return () => window.removeEventListener('beforeunload', beforeunload)
  }, [beforeunload])
}
