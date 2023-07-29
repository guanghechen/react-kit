import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import type { ISubscriber } from '../src'
import { Observable } from '../src'

class Subscriber implements ISubscriber<number> {
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

describe('Observable', () => {
  let consoleMock: IConsoleMock
  beforeEach(() => {
    consoleMock = createConsoleMock(['log', 'warn'])
  })
  afterEach(() => {
    consoleMock.restore()
  })

  test('do not unsubscribe', async () => {
    const observable = new Observable<number>(1, { delay: 1 })

    const subscriber0 = new Subscriber('subscriber0', 0)
    expect(subscriber0.value).toEqual(0)

    observable.subscribe(subscriber0)

    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber0.value).toEqual(1)
    expect(observable.disposed).toEqual(false)

    observable.next(2)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber0.value).toEqual(1)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber0.value).toEqual(2)

    observable.dispose()

    observable.next(3)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber0.value).toEqual(2)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber0.value).toEqual(2)

    const subscriber1 = new Subscriber('subscriber1', 0)
    observable.subscribe(subscriber1)

    observable.next(4)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber0.value).toEqual(2)
    expect(subscriber1.value).toEqual(0)

    await delay(100)
    expect(subscriber0.value).toEqual(2)
    expect(subscriber1.value).toEqual(0)

    expect(consoleMock.getIndiscriminateAll()).toMatchInlineSnapshot(`
      [
        [
          "[in test] called subscriber0.complete",
        ],
        [
          "[Observable] Don't update a disposed observable. value:",
          3,
        ],
        [
          "[in test] called subscriber1.complete",
        ],
        [
          "[Observable] Don't update a disposed observable. value:",
          4,
        ],
      ]
    `)
  })

  test('unsubscribe', async () => {
    const observable = new Observable<number>(1, { delay: 1 })

    const subscriber = new Subscriber('subscriber', 0)
    expect(subscriber.value).toEqual(0)

    const unsubscribable = observable.subscribe(subscriber)

    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber.value).toEqual(1)
    expect(observable.disposed).toEqual(false)

    observable.next(2)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber.value).toEqual(1)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber.value).toEqual(2)

    unsubscribable.unsubscribe()

    observable.next(3)
    expect(observable.getSnapshot()).toEqual(3)
    expect(subscriber.value).toEqual(2)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(3)
    expect(subscriber.value).toEqual(2)

    expect(consoleMock.getIndiscriminateAll()).toMatchInlineSnapshot(`[]`)
  })

  test('debounce', async () => {
    const observable = new Observable<number>(1, { delay: 1 })

    const subscriber = new Subscriber('subscriber', 0)
    expect(subscriber.value).toEqual(0)

    observable.subscribe(subscriber)

    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber.value).toEqual(1)
    expect(observable.disposed).toEqual(false)

    observable.next(2)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber.value).toEqual(1)
    observable.next(3)
    expect(observable.getSnapshot()).toEqual(3)
    expect(subscriber.value).toEqual(1)
    observable.next(4)
    expect(observable.getSnapshot()).toEqual(4)
    expect(subscriber.value).toEqual(1)
    observable.next(5)
    expect(observable.getSnapshot()).toEqual(5)
    expect(subscriber.value).toEqual(1)
    observable.next(6)
    expect(observable.getSnapshot()).toEqual(6)
    expect(subscriber.value).toEqual(1)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(6)
    expect(subscriber.value).toEqual(6)

    observable.next(7)
    expect(observable.getSnapshot()).toEqual(7)
    expect(subscriber.value).toEqual(6)

    observable.dispose()
    expect(subscriber.value).toEqual(7)
  })
})

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
