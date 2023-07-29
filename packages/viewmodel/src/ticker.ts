import { Disposable } from './disposable'
import { Observable } from './observable'
import type {
  IDisposable,
  IObservable,
  IObservableOptions,
  IObservableValue,
  ITicker,
} from './types'

export class Ticker extends Observable<number> implements ITicker {
  protected readonly _observableMap: Map<IObservable<IObservableValue>, IDisposable>

  constructor(start?: number, options?: IObservableOptions<number>) {
    super(start ?? 0, options)
    this._observableMap = new Map()
  }

  public override dispose(): void {
    if (!this.disposed) {
      super.dispose()
      for (const disposable of this._observableMap.values()) disposable.dispose()
      this._observableMap.clear()
    }
  }

  public tick(): void {
    this.next(this._value + 1)
  }

  public observe(observable: IObservable<IObservableValue>): void {
    if (this.disposed) {
      console.warn('[Ticker.observe] the ticker has been disposed.')
      return
    }

    if (!this._observableMap.has(observable)) {
      const unsubscribable = observable.subscribe({
        next: (): void => {
          if (!disposable.disposed) this.tick()
        },
        complete: (): void => disposable.dispose(),
      })
      const disposable = new Disposable(() => unsubscribable.unsubscribe())
      this._observableMap.set(observable, disposable)
    }
  }
}
