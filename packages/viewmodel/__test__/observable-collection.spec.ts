import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import { ObservableCollection } from '../src'
import type { IImmutableCollection, IObservableCollection } from '../src'
import { ImmutableMap, Subscriber, delay } from './_common'

describe('ObservableMap', () => {
  let observableMap: IObservableCollection<string, string, IImmutableCollection<string, string>>
  let consoleMock: IConsoleMock
  beforeEach(() => {
    consoleMock = createConsoleMock(['log', 'warn'])
  })
  afterEach(() => {
    consoleMock.restore()
  })

  beforeEach(() => {
    observableMap = new ObservableCollection<string, string, IImmutableCollection<string, string>>(
      new ImmutableMap<string, string>(),
    )
  })

  afterEach(() => {
    observableMap.dispose()
  })

  test('observeKey', async () => {
    const observableA = observableMap.observeKey('A')
    const observableB = observableMap.observeKey('B')
    const subscriberA = new Subscriber<string>('A', '')
    const subscriberB = new Subscriber<string>('B', '')
    const unsubscribableA = observableA.subscribe(subscriberA)
    const unsubscribableB = observableA.subscribe(subscriberA)

    expect(observableA.disposed).toEqual(false)
    expect(observableB.disposed).toEqual(false)

    expect(observableA.getSnapshot()).toEqual(undefined)
    expect(observableB.getSnapshot()).toEqual(undefined)
    expect(subscriberA.value).toEqual('')
    expect(subscriberB.value).toEqual('')

    observableMap.set('A', 'waw')
    expect(observableA.getSnapshot()).toEqual(undefined)
    expect(observableB.getSnapshot()).toEqual(undefined)
    expect(subscriberA.value).toEqual('')
    expect(subscriberB.value).toEqual('')
    await delay(100)
    expect(observableA.getSnapshot()).toEqual('waw')
    expect(observableB.getSnapshot()).toEqual(undefined)
    expect(subscriberA.value).toEqual('waw')
    expect(subscriberB.value).toEqual('')

    observableMap.set('B', 'waw2')
    expect(observableA.getSnapshot()).toEqual('waw')
    expect(observableB.getSnapshot()).toEqual(undefined)
    expect(subscriberA.value).toEqual('waw')
    expect(subscriberB.value).toEqual('')
    await delay(100)
    expect(observableA.getSnapshot()).toEqual('waw')
    expect(observableB.getSnapshot()).toEqual('waw2')
    expect(subscriberA.value).toEqual('waw')
    expect(subscriberB.value).toEqual('waw2')

    expect(consoleMock.getIndiscriminateAll()).toMatchInlineSnapshot()
  })
})
