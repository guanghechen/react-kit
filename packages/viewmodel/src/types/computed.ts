import type { IDisposable, IObservableValue } from './common'

export type IComputableValue = IObservableValue

export interface IComputed<T extends IComputableValue> extends IDisposable {
  getSnapshot: () => T
  getServerSnapshot?: () => T
  subscribeStateChange: (onStoreChange: () => void) => () => void
}
