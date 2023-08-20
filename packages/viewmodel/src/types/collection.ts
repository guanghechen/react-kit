import type { IObservableValue } from './common'

export interface IImmutableCollection<K, V extends IObservableValue> {
  has(key: K): boolean
  get(key: K): V | undefined
  keys(): Iterable<K>
  values(): Iterable<V>
  entries(): Iterable<[K, V]>
  set(key: K, value: V): this // return a new IImutableCollection<K, V>
  delete(key: K): this // return a new IImutableCollection<K, V>
  deleteAll(keys: Iterable<K>): this // return a new IImutableCollection<K, V>
  merge(entries: Iterable<[K, V]>): this // return a new IImutableCollection<K, V>
}
