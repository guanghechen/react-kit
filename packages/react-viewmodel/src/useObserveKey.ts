import type {
  IImmutableCollection,
  IObservableCollection,
  IObservableValue,
} from '@guanghechen/viewmodel'
import { useEffect, useState } from 'react'

export function useObserveKey<K, V extends IObservableValue, C extends IImmutableCollection<K, V>>(
  collection: IObservableCollection<K, V, C>,
  key: K,
): V | undefined {
  const [state, setState] = useState<V | undefined>(collection.get(key))

  useEffect(() => {
    const isUnsubscribed = false
    const unsubscribable = collection.subscribeKey(key, {
      next: v => setState(v),
      complete: unsubscribe,
    })
    return unsubscribe

    function unsubscribe(): void {
      if (isUnsubscribed) return
      unsubscribable.unsubscribe()
    }
  }, [collection, key])

  return state
}
