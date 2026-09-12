import { ObservableCollection } from '@guanghechen/viewmodel'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { commit, render, unmount } from '../../react-hooks/__test__/fixtures/hooks'
import { useObserveKey } from '../src/useObserveKey'

vi.mock('react', async () => {
  const { react } = await import('../../react-hooks/__test__/fixtures/hooks')
  return { default: react, ...react }
})

class TestMap<V> extends Map<string, V> {
  public withMutations(mutator: (mutable: this) => void): this {
    mutator(this)
    return this
  }
}

type ICallback = () => number

let collection: ObservableCollection<string, ICallback, TestMap<ICallback>>

beforeEach(() => {
  collection = new ObservableCollection(new TestMap<ICallback>())
})

afterEach(() => {
  unmount()
  collection.dispose()
})

describe('useObserveKey function values', () => {
  it('preserves the initial function through render and subscription without invoking it', () => {
    const callback = vi.fn(() => 41)
    collection.next(new TestMap([['callback', callback]]))

    expect(render(() => useObserveKey(collection, 'callback'))).toBe(callback)
    expect(callback).not.toHaveBeenCalled()

    commit()
    expect(render(() => useObserveKey(collection, 'callback'))).toBe(callback)
    expect(callback).not.toHaveBeenCalled()
  })

  it('preserves function replacements and handles a missing key', () => {
    expect(render(() => useObserveKey(collection, 'callback'))).toBeUndefined()
    commit()

    const first = vi.fn(() => 41)
    collection.next(new TestMap([['callback', first]]))
    expect(render(() => useObserveKey(collection, 'callback'))).toBe(first)
    expect(first).not.toHaveBeenCalled()

    const second = vi.fn(() => 42)
    collection.next(new TestMap([['callback', second]]))
    expect(render(() => useObserveKey(collection, 'callback'))).toBe(second)
    expect(second).not.toHaveBeenCalled()

    collection.next(new TestMap<ICallback>())
    expect(render(() => useObserveKey(collection, 'callback'))).toBeUndefined()
  })
})
