/**
 * Copy & Paste from lodash.
 * @see https://github.com/lodash/lodash/blob/2da024c3b4f9947a48517639de7560457cd4ec6c/throttle.js
 */

import type { IDebounceOptions, IDebouncedFunc } from './debounce'
import { debounce } from './debounce'

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait?: number,
  options?: IDebounceOptions,
): IDebouncedFunc<T> {
  if (typeof func !== 'function') throw new TypeError('Expected a function')

  const leading = Boolean(options?.leading ?? true)
  const trailing = Boolean(options?.trailing ?? true)
  return debounce(func, wait, { leading, trailing, maxWait: wait })
}
