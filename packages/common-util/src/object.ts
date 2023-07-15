export function buildObjectFromEntries<K extends string, V1, V2 = V1>(
  entries: Iterable<[key: K, val: V1]>,
  transform: (val: V1) => V2,
  filter: (key: K, val: V1) => boolean = () => true,
): Record<K, V2> {
  const result: Record<K, V2> = {} as unknown as Record<K, V2>
  for (const [key, val] of entries) {
    if (filter(key, val)) result[key] = transform(val)
  }
  return result
}
