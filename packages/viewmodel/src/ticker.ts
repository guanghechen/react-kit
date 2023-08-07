import { Observable } from './observable'
import type {
  IDisposable,
  IObservable,
  IObservableOptions,
  IObservableValue,
  ITicker,
} from './types'
import { buildDisposable } from './util'

export class Ticker extends Observable<number> implements ITicker {
  protected readonly _observes: Set<IObservable<IObservableValue>>

  constructor(start?: number, options?: IObservableOptions<number>) {
    super(start ?? 0, options)
    this._observes = new Set<IObservable<IObservableValue>>()
  }

  public override dispose(): void {
    if (!this.disposed) {
      super.dispose()
      this._observes.clear()
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

    if (!this._observes.has(observable)) {
      const unsubscribable = observable.subscribe({
        next: (): void => {
          if (!disposable.disposed) this.tick()
        },
        complete: (): void => disposable.dispose(),
      })
      const disposable: IDisposable = buildDisposable(() => unsubscribable.unsubscribe())
      this._observes.add(observable)
      this.registerDisposable(disposable)
    }
  }
}
