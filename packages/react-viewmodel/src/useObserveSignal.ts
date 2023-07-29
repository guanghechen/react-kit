import type { IObservableKey, IViewModel } from '@guanghechen/viewmodel'
import React from 'react'

export function useObserveSignal<M extends IViewModel, K extends IObservableKey<M>>(
  viewmodel: M,
  keys: K[],
): number {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { ticker } = React.useMemo(() => viewmodel.ticker(keys), [viewmodel, ...keys])
  const [signal, setSignal] = React.useState<number>(0)

  React.useEffect(() => {
    const unsubscribable = ticker.subscribe({
      next: () => setSignal(s => s + 1),
      complete: () => {},
    })
    return () => unsubscribable.unsubscribe()
  }, [ticker])

  return signal
}
