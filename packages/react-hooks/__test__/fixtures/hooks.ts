import type { DependencyList, EffectCallback, SetStateAction } from 'react'

interface ISlot {
  value?: unknown
  deps?: DependencyList
  cleanup?: () => void
}

// A synchronous hook test double: renders and effects are advanced explicitly.
// This supports behavior tests, not React scheduling or renderer integration tests.
let slots: ISlot[] = []
let cursor = 0
let effects: Array<() => void> = []

function nextSlot(): ISlot {
  const index = cursor++
  slots[index] ??= {}
  return slots[index]
}

function changed(previous?: DependencyList, next?: DependencyList): boolean {
  return (
    !previous ||
    !next ||
    previous.length !== next.length ||
    next.some((value, index) => !Object.is(value, previous[index]))
  )
}

function useRef<T>(value: T): { current: T } {
  const slot = nextSlot()
  slot.value ??= { current: value }
  return slot.value as { current: T }
}

function useState<T>(initial: T | (() => T)): [T, (patch: SetStateAction<T>) => void] {
  const slot = nextSlot()
  if (!('value' in slot)) {
    slot.value = typeof initial === 'function' ? (initial as () => T)() : initial
  }
  return [
    slot.value as T,
    patch => {
      slot.value = typeof patch === 'function' ? (patch as (prev: T) => T)(slot.value as T) : patch
    },
  ]
}

function useMemo<T>(factory: () => T, deps?: DependencyList): T {
  const slot = nextSlot()
  if (changed(slot.deps, deps)) {
    slot.value = factory()
    slot.deps = deps
  }
  return slot.value as T
}

function useCallback<T>(callback: T, deps?: DependencyList): T {
  return useMemo(() => callback, deps)
}

function useEffect(setup: EffectCallback, deps?: DependencyList): void {
  const slot = nextSlot()
  if (changed(slot.deps, deps)) {
    effects.push(() => {
      slot.cleanup?.()
      slot.cleanup = setup() || undefined
    })
    slot.deps = deps
  }
}

export const react = {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect: useEffect,
}

export function render<T>(hook: () => T): T {
  cursor = 0
  return hook()
}

export function commit(): void {
  const pending = effects
  effects = []
  for (const effect of pending) effect()
}

export function unmount(): void {
  for (const slot of slots) slot.cleanup?.()
  slots = []
  cursor = 0
  effects = []
}
