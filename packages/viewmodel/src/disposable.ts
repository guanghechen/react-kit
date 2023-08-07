import type { IDisposable } from './types'
import { disposeAll } from './util'

export class Disposable implements IDisposable {
  protected _disposed: boolean
  protected readonly _disposables: IDisposable[]

  constructor() {
    this._disposed = false
    this._disposables = []
  }

  public get disposed(): boolean {
    return this._disposed
  }

  public dispose(): void {
    if (!this._disposed) {
      this._disposed = true
      disposeAll(this._disposables)
      this._disposables.length = 0
    }
  }

  public registerDisposable<T extends IDisposable>(disposable: T): void {
    if (this._disposed) disposable.dispose()
    else this._disposables.push(disposable)
  }
}
