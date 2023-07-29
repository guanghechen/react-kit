import type { IDisposable, IEquals, IObservableValue, ISubscribable } from './common'

export interface IObservableOptions<T extends IObservableValue> {
  equals?: IEquals<T>
  delay?: number
}

export interface IObservable<T extends IObservableValue> extends ISubscribable<T>, IDisposable {
  readonly equals: IEquals<T>
  getSnapshot(): T
  next(value: T): void
}

export type IValueList<T extends Array<IObservable<any>>> = {
  [K in keyof T]: T[K] extends IObservable<infer U> ? U : never
}

export type IValueMap<T extends object> = {
  [key in keyof T]: T[key] extends IObservable<infer U> ? U : never
}

export type IObservableMap<T extends object> = {
  [key in keyof T]: T[key] extends IObservable<any> ? T[key] : never
}

export type IObservableKey<T extends object> = keyof {
  [key in keyof T]: T[key] extends IObservable<any> ? key : never
}
