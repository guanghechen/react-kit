/**
 * Inspired by https://github.com/epoberezkin/fast-deep-equal.
 *
 * @param x
 * @param y
 * @returns
 */
export function isEqual(x: any, y: any): boolean {
  if (x === y) return true

  if (x && y && typeof x == 'object' && typeof y == 'object') {
    if (x.constructor !== y.constructor) return false

    if (Array.isArray(x)) {
      if (x.length != y.length) return false
      for (let i = 0; i < x.length; ++i) {
        if (!isEqual(x[i], y[i])) return false
      }
      return true
    }

    if (x.constructor === RegExp) return x.source === y.source && x.flags === y.flags
    if (x.valueOf !== Object.prototype.valueOf) return x.valueOf() === y.valueOf()
    if (x.toString !== Object.prototype.toString) return x.toString() === y.toString()

    const keys = Object.keys(x)
    if (keys.length !== Object.keys(y).length) return false;

    for (let i = 0; i < keys.length; ++i) {
      if (!Object.prototype.hasOwnProperty.call(y, keys[i])) return false
    }

    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]

      // React-specific: avoid traversing React elements' _owner.
      //  _owner contains circular references
      // and is not needed when comparing the actual elements (and not their owners)
      if (key === '_owner' && x.$$typeof) continue

      if (!isEqual(x[key], y[key])) return false
    }

    return true
  }

  // true if both NaN, false otherwise
  return x !== x && y !== y
}

export default isEqual
