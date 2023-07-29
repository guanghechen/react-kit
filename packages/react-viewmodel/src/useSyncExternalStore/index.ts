/**
 * @see https://github.com/facebook/react/blob/493f72b0a7111b601c16b8ad8bc2649d82c184a0/packages/use-sync-external-store/src/useSyncExternalStoreShim.js
 */
import React from 'react'
import { useSyncExternalStore as client } from './client'
import { useSyncExternalStore as server } from './server'

const canUseDOM: boolean = !!(
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
)

const shim = canUseDOM ? client : server
const builtin = React.useSyncExternalStore

export const useSyncExternalStore: <T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T,
) => T = (builtin as any) ? builtin : shim
