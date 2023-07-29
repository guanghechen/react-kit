import type { IObservableKey, IViewModel } from '@guanghechen/viewmodel'
import { useEffect, useMemo, useState } from 'react'

export function useObserveSignal<M extends IViewModel, K extends IObservableKey<M>>(
  viewmodel: M,
  keys: K[],
): number {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { ticker } = useMemo(() => viewmodel.ticker(keys), [viewmodel, ...keys])
  const [signal, setSignal] = useState<number>(0)

  useEffect(() => {
    const unsubscribable = ticker.subscribe({
      next: () => setSignal(s => s + 1),
      complete: () => {},
    })
    return () => unsubscribable.unsubscribe()
  }, [ticker])

  return signal
}
