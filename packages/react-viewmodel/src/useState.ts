import type { IState } from '@guanghechen/viewmodel'
import type React from 'react'
import { useSyncExternalStore } from './useSyncExternalStore'

type ISetState<T> = (patch: (prev: T) => T) => void

export function useStateValue<T>(state$: IState<T>): T {
  const { getSnapshot, getServerSnapshot, subscribeStateChange } = state$
  return useSyncExternalStore(subscribeStateChange, getSnapshot, getServerSnapshot)
}

export function useSetState<T>(state$: IState<T>): ISetState<T> {
  const { setState } = state$
  return setState
}

export function useState<T>(state$: IState<T>): [T, ISetState<T>] {
  const { getSnapshot, getServerSnapshot, subscribeStateChange, setState } = state$
  const state = useSyncExternalStore(subscribeStateChange, getSnapshot, getServerSnapshot)
  return [state, setState]
}
