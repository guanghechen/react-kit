import type { IComputed } from '@guanghechen/viewmodel'
import { useSyncExternalStore } from './useSyncExternalStore'

export function useComputed<T>(computed$: IComputed<T>): T {
  const { getSnapshot, getServerSnapshot, subscribeStateChange } = computed$
  return useSyncExternalStore(subscribeStateChange, getSnapshot, getServerSnapshot)
}
