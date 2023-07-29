import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

/**
 * Reinitialize the state if the related props changed..
 * @param initialState
 * @returns
 */
export function useSyncState<S>(initialState: S): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState(initialState)
  useEffect(() => setState(initialState), [initialState])
  return [state, setState]
}
