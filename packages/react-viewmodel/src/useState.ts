import type { IState } from '@guanghechen/viewmodel'
import { useSyncExternalStore } from './useSyncExternalStore'

export type ISetState<T> = (patch: (prev: T) => T) => void
export type IUpdateState<T> = T | ISetState<T>

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

export function useReactState<T>(state$: IState<T>): [T, IUpdateState<T>] {
  const { getSnapshot, getServerSnapshot, subscribeStateChange, updateState } = state$
  const state = useSyncExternalStore(subscribeStateChange, getSnapshot, getServerSnapshot)
  return [state, updateState]
}
