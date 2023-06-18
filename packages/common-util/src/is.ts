export function isPromise<D = unknown>(obj: unknown): obj is Promise<D> {
  if (obj === null || typeof obj !== 'object') return false
  if (obj instanceof Promise) return true
  return typeof (obj as any).then === 'function'
}
