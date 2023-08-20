import { BatchDisposable, Disposable } from './disposable'
import { DisposedObservable, Observable } from './observable'
import { Schedulable } from './schedulable'
import type {
  IEquals,
  IImmutableCollection,
  IObservable,
  IObservableCollection,
  IObservableCollectionOptions,
  IObservableKeyChange,
  IObservableValue,
  IScheduleTransaction,
  ISubscriber,
  IUnsubscribable,
} from './types'
import { noopUnsubscribable } from './util'

export class ObservableCollection<
    K,
    V extends IObservableValue,
    C extends IImmutableCollection<K, V>,
  >
  extends BatchDisposable
  implements IObservableCollection<K, V, C>
{
  public readonly equals: IEquals<C>
  public readonly valueEquals: IEquals<V | undefined>
  protected readonly _keySubscribersMap: Map<K, ReadonlyArray<ISubscriber<V | undefined>>>
  protected _subscribers: ReadonlyArray<ISubscriber<C>>
  protected _value: C

  constructor(defaultValue: C, options: IObservableCollectionOptions<V> = {}) {
    super()
    this._value = defaultValue
    this._subscribers = []
    this._keySubscribersMap = new Map()
    this.valueEquals =
      options.valueEquals ?? ((x: V | undefined, y: V | undefined) => Object.is(x, y))
    this.equals = (x: C, y: C) => Object.is(x, y)
  }

  public override dispose(): void {
    if (!this.disposed) {
      super.dispose()

      // Reset subscribers and avoid unexpected modification on iterator.
      const subscribers: ReadonlyArray<ISubscriber<C>> = this._subscribers
      this._subscribers = []
      subscribers.forEach(subscriber => subscriber.complete())

      const keySubscribersMap = new Map(this._keySubscribersMap)
      this._keySubscribersMap.clear()
      for (const subscribers of keySubscribersMap.values()) {
        subscribers.forEach(subscriber => subscriber.complete())
      }
      keySubscribersMap.clear()
    }
  }

  public has(key: K): boolean {
    return this._value.has(key)
  }

  public get(key: K): V | undefined {
    return this._value.get(key)
  }

  public keys(): Iterable<K> {
    return this._value.keys()
  }

  public values(): Iterable<V> {
    return this._value.values()
  }

  public entries(): Iterable<[K, V]> {
    return this._value.entries()
  }

  public set(key: K, value: V, transaction?: IScheduleTransaction): void {
    const prevKeyValue: V | undefined = this._value.get(key)
    const nextKeyValue = value
    if (this.valueEquals(nextKeyValue, prevKeyValue)) return

    const changes: Array<IObservableKeyChange<K, V>> = [{ key, value, prevValue: prevKeyValue }]

    const prevValue: C = this._value
    const nextValue: C = this._value.set(key, nextKeyValue)
    this._value = nextValue
    this.notify(nextValue, prevValue, changes, transaction)
  }

  public delete(key: K, transaction?: IScheduleTransaction): void {
    if (!this._value.has(key)) return

    const prevKeyValue: V | undefined = this._value.get(key)
    const changes: Array<IObservableKeyChange<K, V>> = [
      { key, value: undefined, prevValue: prevKeyValue },
    ]

    const prevValue: C = this._value
    const nextValue: C = this._value.delete(key)
    this._value = nextValue
    this.notify(nextValue, prevValue, changes, transaction)
  }

  public deleteAll(keys: Iterable<K>, transaction?: IScheduleTransaction): void {
    const changes: Array<IObservableKeyChange<K, V>> = []
    for (const key of keys) {
      if (this._value.has(key)) {
        const prevKeyValue: V | undefined = this._value.get(key)
        changes.push({ key, value: undefined, prevValue: prevKeyValue })
      }
    }

    if (changes.length <= 0) return

    const prevValue: C = this._value
    const nextValue: C = this._value.deleteAll(changes.map(c => c.key))
    this._value = nextValue
    this.notify(nextValue, prevValue, changes, transaction)
  }

  public merge(entries: Iterable<[K, V]>, transaction?: IScheduleTransaction): void {
    const changes: Array<IObservableKeyChange<K, V>> = []
    for (const [key, nextKeyValue] of entries) {
      const prevKeyValue: V | undefined = this._value.get(key)
      if (!this.valueEquals(nextKeyValue, prevKeyValue)) {
        changes.push({ key, value: nextKeyValue, prevValue: prevKeyValue })
      }
    }

    if (changes.length <= 0) return

    const prevValue: C = this._value
    const nextValue: C = this._value.merge(changes.map(c => [c.key, c.value!]))
    this._value = nextValue
    this.notify(nextValue, prevValue, changes, transaction)
  }

  public getSnapshot(): C {
    return this._value
  }

  public subscribe(subscriber: ISubscriber<C>): IUnsubscribable {
    if (this.disposed) {
      subscriber.complete()
      return noopUnsubscribable
    }

    if (!this._subscribers.includes(subscriber)) {
      this._subscribers = [...this._subscribers, subscriber]
    }
    return {
      unsubscribe: () => {
        if (this._subscribers.includes(subscriber)) {
          this._subscribers = this._subscribers.filter(s => s !== subscriber)
        }
      },
    }
  }

  public next(value: C, transaction?: IScheduleTransaction): void {
    const changes: Array<IObservableKeyChange<K, V>> = []
    const prevValue: C = this._value

    // Deleted keys.
    for (const [key, prevKeyValue] of prevValue.entries()) {
      if (!value.has(key)) {
        changes.push({ key, value: undefined, prevValue: prevKeyValue })
      }
    }

    // Added keys or changed keys.
    for (const [key, nextKeyValue] of value.entries()) {
      const prevKeyValue = prevValue.get(key)
      if (!prevValue.has(key) || !this.valueEquals(nextKeyValue, prevKeyValue)) {
        changes.push({ key, value: nextKeyValue, prevValue: undefined })
      }
    }

    if (changes.length <= 0) return

    const nextValue: C = value
    this._value = nextValue
    this.notify(nextValue, prevValue, changes, transaction)
  }

  public observeKey(key: K): IObservable<V | undefined> {
    const value: V | undefined = this._value.get(key)
    if (this.disposed) return new DisposedObservable<V | undefined>(value, this.valueEquals)

    const observable = new Observable<V | undefined>(value, { equals: this.valueEquals })
    const unsubscribable: IUnsubscribable = this.subscribeKey(key, {
      next: v => observable.next(v),
      complete: () => observable.dispose(),
    })
    observable.registerDisposable(Disposable.fromUnsubscribable(unsubscribable))
    this.registerDisposable(observable)
    return observable
  }

  public subscribeKey(key: K, subscriber: ISubscriber<V | undefined>): IUnsubscribable {
    if (this.disposed) {
      subscriber.complete()
      return noopUnsubscribable
    }

    const keySubscribers = this._keySubscribersMap.get(key)
    const nextKeySubscribers =
      keySubscribers === undefined
        ? [subscriber]
        : keySubscribers.includes(subscriber)
        ? keySubscribers
        : [...keySubscribers, subscriber]
    if (keySubscribers !== nextKeySubscribers) this._keySubscribersMap.set(key, nextKeySubscribers)
    return {
      unsubscribe: () => {
        const latestKeySubscribers = this._keySubscribersMap.get(key)
        if (latestKeySubscribers !== undefined && latestKeySubscribers.includes(subscriber)) {
          this._keySubscribersMap.set(
            key,
            latestKeySubscribers.filter(s => s !== subscriber),
          )
        }
      },
    }
  }

  protected notify(
    value: C,
    prevValue: C,
    changes: ReadonlyArray<IObservableKeyChange<K, V>>,
    transaction: IScheduleTransaction | undefined,
  ): void {
    if (transaction) {
      transaction.step(new Schedulable(() => this.notifyImmediate(value, prevValue, changes)))
    } else {
      this.notifyImmediate(value, prevValue, changes)
    }
  }

  protected notifyImmediate(
    value: C,
    prevValue: C,
    changes: ReadonlyArray<IObservableKeyChange<K, V>>,
  ): void {
    // Notify key-subscribers.
    for (const change of changes) {
      const keySubscribers = this._keySubscribersMap.get(change.key)
      if (keySubscribers !== undefined) {
        for (const subscriber of keySubscribers) {
          subscriber.next(change.value, change.prevValue)
        }
      }
    }

    // Notify subscribers.
    const subscribers = this._subscribers
    for (const subscriber of subscribers) {
      subscriber.next(value, prevValue)
    }
  }
}
