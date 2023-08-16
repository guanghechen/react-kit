import { BatchDisposable } from './disposable'
import type {
  IEquals,
  IObservable,
  IObservableOptions,
  IObservableValue,
  ISubscriber,
  IUnsubscribable,
} from './types'

export class Observable<T extends Readonly<IObservableValue>>
  extends BatchDisposable
  implements IObservable<T>
{
  public readonly delay: number
  public readonly equals: IEquals<T>
  protected _subscribers: ReadonlyArray<ISubscriber<T>>
  protected _value: T
  protected _nextCallerTimer: ReturnType<typeof setTimeout> | undefined
  protected _nextCaller: (() => void) | undefined

  constructor(defaultValue: T, options: IObservableOptions<T> = {}) {
    super()
    this._subscribers = []
    this._value = defaultValue
    this.delay = Math.max(0, Number(options.delay) || 0)
    this.equals = options.equals ?? ((x: T, y: T) => Object.is(x, y))
  }

  public override dispose(): void {
    if (!this.disposed) {
      super.dispose()

      // Clear timer.
      if (this._nextCallerTimer !== undefined) {
        const callerTimer = this._nextCallerTimer
        const caller = this._nextCaller

        this._nextCallerTimer = undefined
        this._nextCaller = undefined

        clearTimeout(callerTimer)
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
    if (this.disposed) {
      subscriber.complete()
      return {
        unsubscribe: () => {},
      }
    }

    if (!this._subscribers.includes(subscriber)) {
      this._subscribers = [...this._subscribers, subscriber]
    }
    return {
      unsubscribe: () => {
        this._subscribers = this._subscribers.filter(s => s !== subscriber)
      },
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
      const callerTimer = this._nextCallerTimer

      this._nextCallerTimer = undefined
      this._nextCaller = undefined

      clearTimeout(callerTimer)
    }

    const caller = (): void => {
      const subscribers: ReadonlyArray<ISubscriber<T>> = this._subscribers
      for (const subscriber of subscribers) subscriber.next(value, prevValue)
    }

    const callerTimer = setTimeout(() => {
      if (this._nextCallerTimer === callerTimer) {
        this._nextCallerTimer = undefined
        this._nextCaller = undefined
        caller()
      }
    }, this.delay)

    this._nextCaller = caller
    this._nextCallerTimer = callerTimer
  }
}
