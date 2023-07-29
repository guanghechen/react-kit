import type { IObservable } from './observable'

export interface ITicker extends IObservable<number> {
  tick(): void

  /**
   * Subscribe the change of an observable.
   * @param observable
   */
  observe(observable: IObservable<any>): void
}
