import type { ISubscriber } from '../src'

export class Subscriber implements ISubscriber<number> {
  public readonly displayName: string
  protected _value: number

  constructor(name: string, initialValue: number) {
    this.displayName = name
    this._value = initialValue
  }

  public get value(): number {
    return this._value
  }

  public next(nextValue: number): void {
    this._value = nextValue
  }

  public complete(): void {
    console.log(`[in test] called ${this.displayName}.complete`)
  }
}
