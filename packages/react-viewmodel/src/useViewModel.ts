import type { IViewModel } from '@guanghechen/viewmodel'
import React from 'react'

type V = IViewModel & { name?: string | null }
type F<T extends V> = () => T | Promise<T>

/**
 * Creates and owns a ViewModel. Each factory call must create a fresh, undisposed instance,
 * returned directly or through a Promise; cached or shared instances are not supported.
 * The factory must tolerate repeated calls, including during StrictMode effect replay.
 * The hook disposes each instance on cleanup or when it resolves after cleanup.
 * Callers must not dispose the instance themselves.
 */
export const useViewModel = <T extends V>(fn: F<T>): T | null => {
  const ref = React.useRef<T | null>(null)
  const [_, setTick] = React.useState<number>(0)

  const fnRef = React.useRef<F<T>>(fn)
  fnRef.current = fn

  React.useEffect(() => {
    let cancelled = false
    if (!ref.current) {
      const promise: Promise<T> = Promise.resolve(fnRef.current())
      void promise
        .then((viewmodel: T): void => {
          if (cancelled) {
            viewmodel.dispose()
            return
          }

          ref.current = viewmodel
          const name: string = viewmodel.name || viewmodel.constructor.name
          console.log(`[useViewModel] creating ${name}.`)
          setTick(c => c + 1)
        })
        .catch(error => {
          console.log('[useViewModel] failed. error:', error)
          if (cancelled) return

          ref.current = null
          setTick(c => c + 1)
        })
    }

    return () => {
      cancelled = true
      const viewmodel: T | null = ref.current
      if (!viewmodel) return

      const name: string = viewmodel.name || viewmodel.constructor.name
      console.log(`[useViewModel] disposing ${name}.`)

      ref.current = null
      viewmodel.dispose()
    }
  }, [])

  return ref.current
}
