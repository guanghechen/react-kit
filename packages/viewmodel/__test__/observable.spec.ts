import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import { DisposedObservable, Observable } from '../src'
import { Subscriber, delay } from './_common'

describe('Observable', () => {
  let consoleMock: IConsoleMock
  beforeEach(() => {
    consoleMock = createConsoleMock(['log', 'warn'])
  })
  afterEach(() => {
    consoleMock.restore()
  })

  test('do not unsubscribe', async () => {
    const observable = new Observable<number>(1)

    const subscriber0 = new Subscriber('subscriber0', 0)
    expect(subscriber0.value).toEqual(0)

    observable.subscribe(subscriber0)

    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber0.value).toEqual(0)
    expect(observable.disposed).toEqual(false)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber0.value).toEqual(0)

    observable.next(2)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber0.value).toEqual(0)

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
    const observable = new Observable<number>(1)

    const subscriber = new Subscriber('subscriber', 0)
    expect(subscriber.value).toEqual(0)

    const unsubscribable = observable.subscribe(subscriber)

    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber.value).toEqual(0)
    expect(observable.disposed).toEqual(false)

    observable.next(2)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber.value).toEqual(0)

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
    const observable = new Observable<number>(1)

    const subscriber = new Subscriber('subscriber', 0)
    expect(subscriber.value).toEqual(0)

    observable.subscribe(subscriber)

    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber.value).toEqual(0)
    expect(observable.disposed).toEqual(false)

    observable.next(2)
    expect(observable.getSnapshot()).toEqual(2)
    expect(subscriber.value).toEqual(0)
    observable.next(3)
    expect(observable.getSnapshot()).toEqual(3)
    expect(subscriber.value).toEqual(0)
    observable.next(4)
    expect(observable.getSnapshot()).toEqual(4)
    expect(subscriber.value).toEqual(0)
    observable.next(5)
    expect(observable.getSnapshot()).toEqual(5)
    expect(subscriber.value).toEqual(0)
    observable.next(6)
    expect(observable.getSnapshot()).toEqual(6)
    expect(subscriber.value).toEqual(0)

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

describe('DisposedObservable', () => {
  let consoleMock: IConsoleMock
  beforeEach(() => {
    consoleMock = createConsoleMock(['log', 'warn'])
  })
  afterEach(() => {
    consoleMock.restore()
  })

  test('do not unsubscribe', async () => {
    const observable = new DisposedObservable<number>(1)
    expect(observable.disposed).toEqual(true)

    const subscriber0 = new Subscriber('subscriber0', 0)
    expect(subscriber0.value).toEqual(0)

    observable.subscribe(subscriber0)

    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber0.value).toEqual(0)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber0.value).toEqual(0)

    observable.next(2)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber0.value).toEqual(0)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber0.value).toEqual(0)

    observable.dispose()

    observable.next(3)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber0.value).toEqual(0)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber0.value).toEqual(0)

    const subscriber1 = new Subscriber('subscriber1', 0)
    observable.subscribe(subscriber1)

    observable.next(4)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber0.value).toEqual(0)
    expect(subscriber1.value).toEqual(0)

    await delay(100)
    expect(subscriber0.value).toEqual(0)
    expect(subscriber1.value).toEqual(0)

    expect(consoleMock.getIndiscriminateAll()).toMatchInlineSnapshot(`
      [
        [
          "[in test] called subscriber0.complete",
        ],
        [
          "[DisposedObservable] Don't update a disposed observable. value:",
          2,
        ],
        [
          "[DisposedObservable] Don't update a disposed observable. value:",
          3,
        ],
        [
          "[in test] called subscriber1.complete",
        ],
        [
          "[DisposedObservable] Don't update a disposed observable. value:",
          4,
        ],
      ]
    `)
  })

  test('unsubscribe', async () => {
    const observable = new DisposedObservable<number>(1)
    expect(observable.disposed).toEqual(true)

    const subscriber = new Subscriber('subscriber', 0)
    expect(subscriber.value).toEqual(0)

    const unsubscribable = observable.subscribe(subscriber)

    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber.value).toEqual(0)

    observable.next(2)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber.value).toEqual(0)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber.value).toEqual(0)

    unsubscribable.unsubscribe()

    observable.next(3)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber.value).toEqual(0)

    await delay(100)
    expect(observable.getSnapshot()).toEqual(1)
    expect(subscriber.value).toEqual(0)

    expect(consoleMock.getIndiscriminateAll()).toMatchInlineSnapshot(`
      [
        [
          "[in test] called subscriber.complete",
        ],
        [
          "[DisposedObservable] Don't update a disposed observable. value:",
          2,
        ],
        [
          "[DisposedObservable] Don't update a disposed observable. value:",
          3,
        ],
      ]
    `)
  })
})
