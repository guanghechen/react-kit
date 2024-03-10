import { Subscriber } from '@guanghechen/viewmodel'
import type {
  IImmutableCollection,
  IObservableCollection,
  ISubscriber,
} from '@guanghechen/viewmodel'
import React from 'react'

export function useObserveKey<K, V, C extends IImmutableCollection<K, V>>(
  collection: IObservableCollection<K, V, C>,
  key: K,
): V | undefined {
  const [state, setState] = React.useState<V | undefined>(collection.get(key))

  React.useEffect(() => {
    const subscriber: ISubscriber<V | undefined> = new Subscriber<V | undefined>({
      onNext: v => setState(v),
    })
    const unsubscribable = collection.subscribeKey(key, subscriber)
    return () => {
      subscriber.dispose()
      unsubscribable.unsubscribe()
    }
  }, [collection, key])

  return state
}
