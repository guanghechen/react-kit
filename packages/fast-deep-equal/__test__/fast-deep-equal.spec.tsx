import isEqual from '../src'

describe('isEqual', () => {
  it('should return true for equal values', () => {
    expect(isEqual(5, 5)).toBe(true)
    expect(isEqual('hello', 'hello')).toBe(true)
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    expect(isEqual({}, {})).toBe(true)
    expect(isEqual([], [])).toBe(true)
    expect(isEqual(Number(1), 1)).toBe(true)
    expect(isEqual(undefined, undefined)).toBe(true)
    expect(isEqual(null, null)).toBe(true)
    expect(isEqual(NaN, NaN)).toBe(true)
    expect(isEqual(/abc/g, new RegExp('abc', 'g'))).toBe(true)
  })

  it('should return false for unequal values', () => {
    expect(isEqual(5, 10)).toBe(false)
    expect(isEqual('hello', 'world')).toBe(false)
    expect(isEqual([1, 2, 3], [1, 2])).toBe(false)
    expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false)
    expect(isEqual(Number(1), Boolean(true))).toBe(false)
    expect(isEqual(undefined, null)).toBe(false)
    expect(isEqual(null, undefined)).toBe(false)
    expect(isEqual(null, {})).toBe(false)
    expect(isEqual({}, null)).toBe(false)
    expect(isEqual(NaN, 0)).toBe(false)
    expect(isEqual(/abc/gi, new RegExp('abc', 'g'))).toBe(false)
    expect(isEqual(/abcd/g, new RegExp('abc', 'g'))).toBe(false)
  })

  it('should handle complex objects', () => {
    const obj1 = { a: 1, b: { c: [1, 2, 3] } }
    const obj2 = { a: 1, b: { c: [1, 2, 3] } }
    const obj3 = { a: 1, b: { c: [1, 2, 4] } }

    expect(isEqual(obj1, obj2)).toBe(true)
    expect(isEqual(obj1, obj3)).toBe(false)
  })

  it('should handle special cases', () => {
    expect(isEqual(undefined, undefined)).toBe(true)
    expect(isEqual(null, null)).toBe(true)
    expect(isEqual(NaN, NaN)).toBe(true)
    expect(isEqual(0, -0)).toBe(false)
    expect(isEqual(Infinity, Infinity)).toBe(true)
  })
})
