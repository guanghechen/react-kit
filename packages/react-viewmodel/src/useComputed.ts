import type { IComputableValue, IComputed } from '@guanghechen/viewmodel'
import { useSyncExternalStore } from './useSyncExternalStore'

export function useComputed<T extends IComputableValue>(computed$: IComputed<T>): T {
  const { getSnapshot, getServerSnapshot, subscribeStateChange } = computed$
  return useSyncExternalStore(subscribeStateChange, getSnapshot, getServerSnapshot)
}
