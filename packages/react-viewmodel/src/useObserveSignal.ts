import { Subscriber } from '@guanghechen/viewmodel'
import type { IObservableKey, ISubscriber, IViewModel } from '@guanghechen/viewmodel'
import React from 'react'

export function useObserveSignal<M extends IViewModel, K extends IObservableKey<M>>(
  viewmodel: M,
  keys: K[],
): number {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { ticker } = React.useMemo(() => viewmodel.ticker(keys), [viewmodel, ...keys])
  const [signal, setSignal] = React.useState<number>(0)

  React.useEffect(() => {
    const subscriber: ISubscriber<number> = new Subscriber<number>({
      onNext: () => setSignal(s => s + 1),
    })
    const unsubscribable = ticker.subscribe(subscriber)
    return () => {
      subscriber.dispose()
      unsubscribable.unsubscribe()
    }
  }, [ticker])

  return signal
}
