import type { IStatableValue, IState } from '@guanghechen/viewmodel'
import type React from 'react'
import { useSyncExternalStore } from './useSyncExternalStore'

export function useStateValue<T extends IStatableValue>(state$: IState<T>): T {
  const { getSnapshot, getServerSnapshot, subscribeStateChange } = state$
  return useSyncExternalStore(subscribeStateChange, getSnapshot, getServerSnapshot)
}

export function useSetState<T extends IStatableValue>(
  state$: IState<T>,
): React.Dispatch<React.SetStateAction<T>> {
  const { setState } = state$
  return setState
}

export function useState<T extends IStatableValue>(
  state$: IState<T>,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const { getSnapshot, getServerSnapshot, subscribeStateChange, setState } = state$
  const state = useSyncExternalStore(subscribeStateChange, getSnapshot, getServerSnapshot)
  return [state, setState]
}
