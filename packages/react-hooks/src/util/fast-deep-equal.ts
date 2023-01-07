/**
 * Migrated from https://github.com/epoberezkin/fast-deep-equal since it's not support ESM
 * @param a
 * @param b
 * @returns
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false

    if (Array.isArray(a)) {
      if (a.length != b.length) return false
      for (let i = 0; i < a.length; ++i) {
        if (!isEqual(a[i], b[i])) return false
      }
      return true
    }

    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf()
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString()

    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false;

    for (let i = 0; i < keys.length; ++i) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false
    }

    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]

      // React-specific: avoid traversing React elements' _owner.
      //  _owner contains circular references
      // and is not needed when comparing the actual elements (and not their owners)
      if (key === '_owner' && a.$$typeof) continue

      if (!isEqual(a[key], b[key])) return false
    }

    return true
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b
}

export default isEqual
