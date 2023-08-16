export type IObservableValue =
  | bigint
  | boolean
  | null
  | number
  | object
  | string
  | symbol
  | undefined
  | void

export interface IDisposable {
  readonly disposed: boolean
  dispose(): void
}

export interface IBatchDisposable extends IDisposable {
  registerDisposable<T extends IDisposable>(disposable: T): void
}

export interface ISubscriber<T> {
  next(value: T, prevValue: T | undefined): void
  complete(): void
}

export interface IUnsubscribable {
  unsubscribe(): void
}

export interface ISubscribable<T> {
  subscribe(subscriber: ISubscriber<T>): IUnsubscribable
}

export type IEquals<T> = (x: T, y: T) => boolean
