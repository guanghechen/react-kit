import type { IImmutableCollection } from './collection'
import type { IEquals, IObservableValue, ISubscriber, IUnsubscribable } from './common'
import type { IObservable } from './observable'

export interface IObservableCollectionOptions<V extends IObservableValue> {
  delay?: number
  valueEquals?: IEquals<V | undefined>
}

export interface IObservableKeyChange<K, V extends IObservableValue> {
  key: K
  value: V | undefined
  prevValue: V | undefined
}

export interface IObservableCollection<
  K,
  V extends IObservableValue,
  C extends IImmutableCollection<K, V>,
> extends IObservable<C> {
  has(key: K): boolean
  get(key: K): V | undefined
  keys(): Iterable<K>
  values(): Iterable<V>
  entries(): Iterable<[K, V]>
  set(key: K, value: V): void
  delete(key: K): void
  deleteAll(keys: Iterable<K>): void
  merge(entries: Iterable<[K, V]>): void
  observeKey(key: K): IObservable<V | undefined>
  subscribeKey(key: K, subscriber: ISubscriber<V | undefined>): IUnsubscribable
}
