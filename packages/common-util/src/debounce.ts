/**
 * Copy & Paste from lodash.
 * @see https://github.com/lodash/lodash/blob/2da024c3b4f9947a48517639de7560457cd4ec6c/debounce.js
 */

import { root } from './root'

type ITimer = ReturnType<typeof setTimeout> | ReturnType<typeof requestAnimationFrame>

export interface IDebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>
  cancel: () => void
  flush: () => ReturnType<T>
  /**
   * Call the function immediately
   * @param args
   */
  flushSync(...args: Parameters<T>): ReturnType<T>
  pending: () => boolean
}

export interface IDebounceOptions {
  leading?: boolean
  maxWait?: number
  trailing?: boolean
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 0,
  options?: IDebounceOptions,
): IDebouncedFunc<T> {
  if (typeof func !== 'function') throw new TypeError('Expected a function')

  let _lastThis: any
  let _lastArgs: Parameters<T> | undefined
  let _lastCallTime: number | undefined
  let _lastInvokeTime = 0
  let _timer: ITimer | undefined
  let result: ReturnType<T>

  const _wait: number = Math.max(0, Number(wait) || 0)
  // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
  const useRAF: boolean = _wait === 0 && typeof root.requestAnimationFrame === 'function'

  // Debounce options.
  const _leading = Boolean(options?.leading ?? false)
  const _trailing = Boolean(options?.trailing ?? true)
  const _maxing: boolean = typeof options?.maxWait === 'number'
  const _maxWait: number = _maxing ? Math.max(Number(options?.maxWait) || 0, _wait) : 0

  function invokeFunc(time: number): ReturnType<T> {
    const thisArg = _lastThis
    const args = _lastArgs as Parameters<T> // args must be exist when call the original func.

    _lastThis = undefined
    _lastArgs = undefined
    _lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function startTimer(pendingFunc: () => void, wait: number): ITimer {
    if (useRAF) {
      root.cancelAnimationFrame(_timer!)
      return root.requestAnimationFrame(pendingFunc)
    }
    return setTimeout(pendingFunc, wait)
  }

  function cancelTimer(id: ITimer | undefined): void {
    if (useRAF) {
      root.cancelAnimationFrame(id!)
      return
    }
    clearTimeout(id!)
  }

  function leadingEdge(now: number): ReturnType<T> {
    _lastInvokeTime = now
    _timer = startTimer(timerExpired, _wait)
    return _leading ? invokeFunc(now) : result
  }

  function remainingWait(now: number): number {
    const timeSinceLastCall = now - (_lastCallTime ?? 0)
    const timeSinceLastInvoke = now - _lastInvokeTime
    const timeWaiting = _wait - timeSinceLastCall
    return _maxing ? Math.min(timeWaiting, _maxWait - timeSinceLastInvoke) : timeWaiting
  }

  function shouldInvoke(now: number): boolean {
    if (_lastCallTime === undefined) return true

    const timeSinceLastCall = now - _lastCallTime
    const timeSinceLastInvoke = now - _lastInvokeTime
    return (
      timeSinceLastCall >= _wait ||
      timeSinceLastCall < 0 ||
      (_maxing && timeSinceLastInvoke >= _maxWait)
    )
  }

  function timerExpired(): void {
    const time = Date.now()
    if (shouldInvoke(time)) {
      trailingEdge(time)
      return
    }
    _timer = startTimer(timerExpired, remainingWait(time))
  }

  function trailingEdge(now: number): ReturnType<T> {
    _timer = undefined
    if (_trailing && _lastArgs) return invokeFunc(now)

    _lastThis = undefined
    _lastArgs = undefined
    return result
  }

  function cancel(): void {
    if (_timer !== undefined) cancelTimer(_timer)

    _lastInvokeTime = 0
    _lastThis = undefined
    _lastArgs = undefined
    _lastCallTime = undefined
    _timer = undefined
  }

  function flush(): ReturnType<T> {
    return _timer === undefined ? result : trailingEdge(Date.now())
  }

  function flushSync(this: any, ...args: Parameters<T>): ReturnType<T> {
    if (_timer !== undefined) cancelTimer(_timer)
    _timer = undefined

    const now: number = Date.now()

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    _lastThis = this
    _lastArgs = args
    _lastCallTime = now
    return invokeFunc(now)
  }

  function pending(): boolean {
    return _timer !== undefined
  }

  const debounced: IDebouncedFunc<T> = function (this: any, ...args) {
    const time: number = Date.now()
    const isInvoking: boolean = shouldInvoke(time)

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    _lastThis = this
    _lastArgs = args
    _lastCallTime = time

    if (isInvoking) {
      if (_timer === undefined) return leadingEdge(_lastCallTime)

      if (_maxing) {
        _timer = startTimer(timerExpired, _wait)
        return invokeFunc(_lastCallTime)
      }
    }

    if (_timer === undefined) _timer = startTimer(timerExpired, _wait)
    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush
  debounced.flushSync = flushSync
  debounced.pending = pending
  return debounced
}
