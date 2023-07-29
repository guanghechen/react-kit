import { Ticker } from './ticker'
import type { IDisposable, IObservableKey, IViewModel, IViewModelTicker } from './types'
import { isDisposable, isObservable } from './util'

export abstract class ViewModel implements IViewModel {
  protected _disposed: boolean
  protected readonly _disposables: IDisposable[]
  protected readonly _tickerMap: Map<string, IViewModelTicker>

  constructor() {
    this._disposed = false
    this._disposables = []
    this._tickerMap = new Map<string, IViewModelTicker>()
  }

  public get disposed(): boolean {
    return this._disposed
  }

  public dispose(): void {
    if (!this._disposed) {
      this._disposed = true
      for (const disposable of this._disposables) disposable.dispose()
      for (const item of this._tickerMap.values()) item.ticker.dispose()
      Reflect.ownKeys(this).forEach(key => {
        if (typeof key === 'string' && key.endsWith('$')) {
          const disposable = this[key as keyof this]
          if (isDisposable(disposable)) disposable.dispose()
        }
      })
    }
  }

  public ticker<K extends IObservableKey<this>>(keys: K[]): Readonly<IViewModelTicker> {
    const _keys: Array<IObservableKey<this>> = Array.from(new Set(keys)).sort()
    const key: string = _keys.join('|')

    let item: IViewModelTicker | undefined = this._tickerMap.get(key)
    if (item === undefined) {
      const ticker = new Ticker()
      for (const obKey of _keys) {
        const observable = this[obKey]
        if (!isObservable(observable)) {
          console.warn(`[ViewModel.ticker] not a observable, key:`, obKey, 'val:', observable)
          continue
        }
        ticker.observe(observable)
      }
      item = {
        keys: _keys as string[],
        ticker: ticker,
      }
      this._tickerMap.set(key, item)
    }
    return item
  }
}
