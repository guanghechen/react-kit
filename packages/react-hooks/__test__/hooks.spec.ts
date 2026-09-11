import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  useBeforeUnloadAsyncEffect,
  useBeforeUnloadEffect,
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareMemo,
  useEventCallback,
  useInterval,
  usePreviousState,
  useRefreshRef,
  useSyncState,
} from '../src'
import { commit, render, unmount } from './fixtures/hooks'

vi.mock('react', async () => {
  const { react } = await import('./fixtures/hooks')
  return { default: react, ...react }
})

afterEach(() => {
  unmount()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('state and callback hooks', () => {
  it('stores function values without invoking them and synchronizes replacements', () => {
    const first = vi.fn(() => 1)
    const second = vi.fn(() => 2)
    const [value, setValue] = render(() => useSyncState(first))
    expect(value).toBe(first)
    commit()
    expect(first).not.toHaveBeenCalled()
    setValue(() => second)
    expect(render(() => useSyncState(first))[0]).toBe(second)
    render(() => useSyncState(second))
    commit()
    expect(render(() => useSyncState(second))[0]).toBe(second)
    expect(second).not.toHaveBeenCalled()
  })

  it('resets local state when the supplied initial value changes', () => {
    const [, setValue] = render(() => useSyncState(1))
    commit()
    setValue(prev => prev + 1)
    expect(render(() => useSyncState(1))[0]).toBe(2)
    expect(render(() => useSyncState(10))[0]).toBe(2)
    commit()
    expect(render(() => useSyncState(10))[0]).toBe(10)
  })

  it('keeps the ref identity while refreshing its value', () => {
    const ref = render(() => useRefreshRef(1))
    expect(render(() => useRefreshRef(2))).toBe(ref)
    expect(ref.current).toBe(2)
  })

  it('returns the value from the previous committed render', () => {
    expect(render(() => usePreviousState('first'))).toBe('first')
    commit()
    expect(render(() => usePreviousState('second'))).toBe('first')
    commit()
    expect(render(() => usePreviousState('third'))).toBe('second')
  })

  it('keeps event callback identity while dispatching to the latest handler', () => {
    const first = vi.fn((value: number): number => value + 1)
    const second = vi.fn((value: number): number => value + 2)
    const callback = render(() => useEventCallback(first))
    commit()
    expect(callback(3)).toBe(4)
    expect(render(() => useEventCallback(second))).toBe(callback)
    commit()
    expect(callback(3)).toBe(5)
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledWith(3)
  })
})

describe('deep comparison hooks', () => {
  it('memoizes by nested dependency values', () => {
    const factory = vi.fn(() => ({}))
    const first = render(() => useDeepCompareMemo(factory, [{ nested: [1] }]))
    expect(render(() => useDeepCompareMemo(factory, [{ nested: [1] }]))).toBe(first)
    expect(render(() => useDeepCompareMemo(factory, [{ nested: [2] }]))).not.toBe(first)
    expect(factory).toHaveBeenCalledTimes(2)
  })

  it('replaces callbacks only when nested dependencies change', () => {
    const first = (): number => 1
    const second = (): number => 2
    expect(render(() => useDeepCompareCallback(first, [{ value: 1 }]))).toBe(first)
    expect(render(() => useDeepCompareCallback(second, [{ value: 1 }]))).toBe(first)
    expect(render(() => useDeepCompareCallback(second, [{ value: 2 }]))).toBe(second)
  })

  it('cleans up and reruns effects only for changed dependencies', () => {
    const cleanup = vi.fn()
    const setup = vi.fn(() => cleanup)
    render(() => useDeepCompareEffect(setup, [{ value: 1 }]))
    commit()
    render(() => useDeepCompareEffect(setup, [{ value: 1 }]))
    commit()
    expect(setup).toHaveBeenCalledOnce()
    render(() => useDeepCompareEffect(setup, [{ value: 2 }]))
    commit()
    expect(setup).toHaveBeenCalledTimes(2)
    expect(cleanup).toHaveBeenCalledOnce()
    unmount()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })
})

describe('effect resource management', () => {
  it('updates interval callbacks, replaces durations, and clears timers on unmount', () => {
    vi.useFakeTimers()
    const first = vi.fn()
    const second = vi.fn()
    render(() => useInterval(first, 100))
    commit()
    vi.advanceTimersByTime(100)
    expect(first).toHaveBeenCalledOnce()
    render(() => useInterval(second, 200))
    commit()
    vi.advanceTimersByTime(199)
    expect(second).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(second).toHaveBeenCalledOnce()
    unmount()
    vi.advanceTimersByTime(1000)
    expect(second).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('registers and removes the beforeunload handler', () => {
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    vi.stubGlobal('window', { addEventListener, removeEventListener })
    const callback = vi.fn()
    render(() => useBeforeUnloadEffect(callback, []))
    commit()
    expect(addEventListener).toHaveBeenCalledWith('beforeunload', callback)
    unmount()
    expect(removeEventListener).toHaveBeenCalledWith('beforeunload', callback)
  })

  it.each([true, false])(
    'handles asynchronous beforeunload with preventDefault=%s',
    async prevent => {
      const addEventListener = vi.fn()
      const removeEventListener = vi.fn()
      vi.stubGlobal('window', { addEventListener, removeEventListener })
      const callback = vi.fn(async (): Promise<void> => {})
      render(() => useBeforeUnloadAsyncEffect(callback, prevent))
      commit()
      const handler = addEventListener.mock.calls[0][1] as (
        event: BeforeUnloadEvent,
      ) => Promise<void>
      const event = { preventDefault: vi.fn(), returnValue: 'pending' }
      await handler(event as unknown as BeforeUnloadEvent)
      expect(callback).toHaveBeenCalledWith(event)
      expect(event.preventDefault).toHaveBeenCalledTimes(prevent ? 1 : 0)
      expect('returnValue' in event).toBe(!prevent)
      unmount()
      expect(removeEventListener).toHaveBeenCalledWith('beforeunload', handler)
    },
  )
})
