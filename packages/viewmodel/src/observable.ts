import { ObservableStatus } from './constant'
import type {
  IEquals,
  IObservable,
  IObservableOptions,
  IObservableValue,
  ISubscriber,
  IUnsubscribable,
} from './types'

export class Observable<T extends Readonly<IObservableValue>> implements IObservable<T> {
  public readonly equals: IEquals<T>
  public readonly delay: number
  protected _subscribers: ReadonlyArray<ISubscriber<T>>
  protected _status: ObservableStatus
  protected _value: T
  protected _nextCaller: (() => void) | undefined
  protected _nextCallerTimer: ReturnType<typeof setTimeout> | undefined

  constructor(defaultValue: T, options: IObservableOptions<T> = {}) {
    this._subscribers = []
    this._status = ObservableStatus.AVAILABLE
    this._value = defaultValue
    this._nextCallerTimer = undefined
    this.delay = Math.max(0, Number(options.delay) || 0)
    this.equals = options.equals ?? ((x: T, y: T) => Object.is(x, y))
  }

  public get disposed(): boolean {
    return this._status === ObservableStatus.DISPOSED
  }

  public dispose(): void {
    if (this._status !== ObservableStatus.DISPOSED) {
      this._status = ObservableStatus.DISPOSED

      // Clear timer.
      if (this._nextCallerTimer !== undefined) {
        clearTimeout(this._nextCallerTimer)
        const caller = this._nextCaller
        this._nextCallerTimer = undefined
        this._nextCaller = undefined
        if (caller) caller()
      }

      // Reset subscribers and avoid unexpected modification on iterator.
      const subscribers: ReadonlyArray<ISubscriber<T>> = this._subscribers
      this._subscribers = []

      for (const subscriber of subscribers) subscriber.complete()
    }
  }

  public getSnapshot(): T {
    return this._value
  }

  public subscribe(subscriber: ISubscriber<T>): IUnsubscribable {
    switch (this._status) {
      case ObservableStatus.AVAILABLE: {
        if (!this._subscribers.includes(subscriber)) {
          this._subscribers = [...this._subscribers, subscriber]
        }

        return {
          unsubscribe: () => {
            this._subscribers = this._subscribers.filter(s => s !== subscriber)
          },
        }
      }
      case ObservableStatus.DISPOSED: {
        subscriber.complete()
        return {
          unsubscribe: () => {},
        }
      }
      /* c8 ignore start */
      default:
        throw new Error(`[Observable] Unexpected Status: ${this._status}.`)
      /* c8 ignore end */
    }
  }

  /**
   * 1. Update observable state.
   * 2. Notify all subscribers if the value is changed.
   */
  public next(value: T): void {
    if (this.disposed) {
      console.warn(`[Observable] Don't update a disposed observable. value:`, value)
      return
    }

    const prevValue: T = this._value
    if (this.equals(value, prevValue)) return

    this._value = value

    // Clear timer
    if (this._nextCallerTimer !== undefined) {
      clearTimeout(this._nextCallerTimer)
      this._nextCallerTimer = undefined
      this._nextCaller = undefined
    }

    const caller = (): void => {
      const subscribers: ReadonlyArray<ISubscriber<T>> = this._subscribers
      for (const subscriber of subscribers) subscriber.next(value, prevValue)
    }
    const callerTimer = setTimeout(
      () => {
        if (this._nextCallerTimer === callerTimer) {
          this._nextCallerTimer = undefined
          this._nextCaller = undefined
          caller()
        }
      },

      this.delay,
    )

    this._nextCaller = caller
    this._nextCallerTimer = callerTimer
  }
}
