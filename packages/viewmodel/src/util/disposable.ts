import type { IDisposable } from '../types'

export function disposeAll(disposables: Iterable<IDisposable>): void | never {
  const errors: unknown[] = []
  for (const disposable of disposables) {
    try {
      disposable.dispose()
    } catch (e) {
      errors.push(e)
    }
  }

  if (errors.length === 1) {
    throw errors[0]
  }

  if (errors.length > 1) {
    throw new AggregateError(errors, 'Encountered errors while disposing')
  }
}

export function buildDisposable(onDispose: () => void): IDisposable {
  let _disposed = false
  const disposable: IDisposable = {
    get disposed(): boolean {
      return _disposed
    },
    dispose: (): void => {
      if (!_disposed) {
        _disposed = true
        onDispose()
      }
    },
  }
  return disposable
}
