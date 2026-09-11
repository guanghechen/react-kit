import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from '../src/debounce'
import { root } from '../src/root'
import { throttle } from '../src/throttle'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('debounce', () => {
  it('uses the current global object', () => {
    expect(root).toBe(globalThis)
  })

  it('coalesces calls using the latest arguments and receiver', () => {
    const call = vi.fn(function (this: { offset: number }, value: number): number {
      return this.offset + value
    })
    const wrapped = debounce(call, 100)
    wrapped.call({ offset: 1 }, 2)
    vi.advanceTimersByTime(60)
    wrapped.call({ offset: 10 }, 3)
    vi.advanceTimersByTime(99)
    expect(call).not.toHaveBeenCalled()
    expect(wrapped.pending()).toBe(true)
    vi.advanceTimersByTime(1)
    expect(call).toHaveBeenCalledTimes(1)
    expect(call).toHaveReturnedWith(13)
    expect(wrapped.pending()).toBe(false)
    expect(wrapped.flush()).toBe(13)
  })

  it('cancels pending work and remains reusable', () => {
    const call = vi.fn()
    const wrapped = debounce(call, 100)
    wrapped()
    wrapped.cancel()
    wrapped.cancel()
    vi.advanceTimersByTime(100)
    expect(call).not.toHaveBeenCalled()
    expect(wrapped.pending()).toBe(false)
    wrapped()
    vi.advanceTimersByTime(100)
    expect(call).toHaveBeenCalledTimes(1)
  })

  it('flushes pending work once and supports immediate replacement', () => {
    const call = vi.fn((value: number): number => value * 2)
    const wrapped = debounce(call, 100)
    wrapped(1)
    expect(wrapped.flush()).toBe(2)
    vi.advanceTimersByTime(100)
    expect(call).toHaveBeenCalledTimes(1)
    wrapped(2)
    expect(wrapped.flushSync(3)).toBe(6)
    vi.advanceTimersByTime(100)
    expect(call.mock.calls).toEqual([[1], [3]])
    expect(wrapped.flushSync(4)).toBe(8)
  })

  it('supports leading calls without a duplicate trailing invocation', () => {
    const call = vi.fn()
    const wrapped = debounce(call, 100, { leading: true })
    wrapped('first')
    expect(call).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(100)
    expect(call).toHaveBeenCalledTimes(1)
    wrapped('second')
    wrapped('third')
    vi.advanceTimersByTime(100)
    expect(call.mock.calls).toEqual([['first'], ['second'], ['third']])
  })

  it('can disable trailing calls', () => {
    const call = vi.fn()
    const wrapped = debounce(call, 100, { leading: true, trailing: false })
    wrapped(1)
    wrapped(2)
    vi.advanceTimersByTime(100)
    expect(call.mock.calls).toEqual([[1]])
  })

  it('bounds latency under continuous calls with maxWait', () => {
    const call = vi.fn()
    const wrapped = debounce(call, 100, { maxWait: 250 })
    wrapped(0)
    for (let i = 1; i <= 3; i += 1) {
      vi.advanceTimersByTime(80)
      wrapped(i)
    }
    expect(call).not.toHaveBeenCalled()
    vi.advanceTimersByTime(10)
    expect(call.mock.calls).toEqual([[3]])
    wrapped(4)
    vi.advanceTimersByTime(100)
    expect(call.mock.calls).toEqual([[3], [4]])
  })

  it('invokes at maxWait even when the timer has not been serviced', () => {
    const call = vi.fn()
    const wrapped = debounce(call, 100, { maxWait: 100 })
    wrapped(1)
    vi.setSystemTime(1100)
    wrapped(2)
    expect(call.mock.calls).toEqual([[2]])
    wrapped.cancel()
  })

  it('uses and cancels animation frames when available', () => {
    vi.stubGlobal('requestAnimationFrame', (callback: () => void): ReturnType<typeof setTimeout> =>
      setTimeout(callback, 16),
    )
    const cancel = vi.fn((id: ReturnType<typeof setTimeout>): void => clearTimeout(id))
    vi.stubGlobal('cancelAnimationFrame', cancel)
    const call = vi.fn()
    const wrapped = debounce(call)
    wrapped()
    vi.advanceTimersByTime(16)
    expect(call).toHaveBeenCalledTimes(1)
    wrapped()
    wrapped.cancel()
    vi.advanceTimersByTime(16)
    expect(call).toHaveBeenCalledTimes(1)
    expect(cancel).toHaveBeenCalled()
  })

  it('rejects a non-callable input', () => {
    expect(() => debounce(null as never)).toThrow(TypeError)
    expect(() => throttle(null as never)).toThrow(TypeError)
  })
})

describe('throttle', () => {
  it('limits a burst to leading and latest trailing calls', () => {
    const call = vi.fn()
    const wrapped = throttle(call, 100)
    wrapped(1)
    wrapped(2)
    wrapped(3)
    expect(call.mock.calls).toEqual([[1]])
    vi.advanceTimersByTime(100)
    expect(call.mock.calls).toEqual([[1], [3]])
  })

  it('accepts leading and trailing overrides', () => {
    const call = vi.fn()
    const wrapped = throttle(call, 100, { leading: false, trailing: true })
    wrapped(1)
    expect(call).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(call).toHaveBeenCalledWith(1)
  })
})
