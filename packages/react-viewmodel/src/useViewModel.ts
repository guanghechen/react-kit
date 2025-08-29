import type { IViewModel } from '@guanghechen/viewmodel'
import React from 'react'

export const useViewModel = <T extends IViewModel & { name?: string | null }>(
  fn: () => T,
): T | null => {
  const ref = React.useRef<T | null>(null)
  const [_, setTick] = React.useState<number>(0)

  const fnRef = React.useRef<() => T>(fn)
  fnRef.current = fn

  React.useEffect(() => {
    if (!ref.current) {
      ref.current = fnRef.current()

      const viewmodel: T = ref.current
      const name: string = viewmodel.name || viewmodel.constructor.name
      console.log(`[useViewModel] creating ${name}.`)
    }

    setTick(c => c + 1)

    return () => {
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
