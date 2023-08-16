import { Disposable } from './disposable'
import { Observable } from './observable'
import { Ticker } from './ticker'
import type {
  IComputableValue,
  IComputed,
  IDisposable,
  IObservable,
  IObservableOptions,
  ISubscriber,
  IValueList,
} from './types'

export class Computed<T extends Readonly<IComputableValue>> implements IComputed<T> {
  protected readonly _observable: IObservable<T>

  constructor(observable: IObservable<T>) {
    this._observable = observable
  }

  public static fromObservables<S extends Array<IObservable<any>>, T extends IComputableValue>(
    observables: S,
    transform: (values: IValueList<S>) => T,
    options?: IObservableOptions<T>,
  ): Computed<T> {
    const ticker = new Ticker()
    for (const source of observables) ticker.observe(source)

    const getSnapshot = (): T => {
      const values = observables.map(source => source.getSnapshot()) as IValueList<S>
      return transform(values)
    }

    const observable = new Observable<T>(getSnapshot(), options)
    observable.registerDisposable(ticker)

    ticker.subscribe({
      next: () => {
        if (!observable.disposed) observable.next(getSnapshot())
      },
      complete: () => observable.dispose(),
    })
    return new Computed<T>(observable)
  }

  public get disposed(): boolean {
    return this._observable.disposed
  }

  public dispose(): void {
    if (!this._observable.disposed) {
      this._observable.dispose()
    }
  }

  public readonly getSnapshot = (): T => {
    return this._observable.getSnapshot()
  }

  public readonly getServerSnapshot = (): T => {
    return this._observable.getSnapshot()
  }

  public readonly subscribeStateChange = (onStateChange: () => void): (() => void) => {
    const subscriber: ISubscriber<T> = {
      next: () => onStateChange(),
      complete: () => {},
    }
    const unsubscribable = this._observable.subscribe(subscriber)
    const disposable: IDisposable = Disposable.fromUnsubscribable(unsubscribable)
    this._observable.registerDisposable(disposable)
    return () => disposable.dispose()
  }
}
