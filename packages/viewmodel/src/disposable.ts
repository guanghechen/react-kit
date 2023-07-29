import type { IDisposable } from './types'

export class Disposable implements IDisposable {
  protected _disposed: boolean
  protected readonly _onDispose: () => void

  constructor(onDispose: () => void) {
    this._disposed = false
    this._onDispose = onDispose
  }

  public get disposed(): boolean {
    return this._disposed
  }

  public dispose(): void {
    if (!this._disposed) {
      this._disposed = true
      this._onDispose()
    }
  }
}
