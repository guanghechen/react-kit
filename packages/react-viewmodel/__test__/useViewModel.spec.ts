import type { IViewModel } from '@guanghechen/viewmodel'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useViewModel } from '../src/useViewModel'

// Exercise effect ordering without a renderer; this does not emulate React scheduling.
const hooks = vi.hoisted(() => ({
  refs: [] as Array<{ current: unknown }>,
  cursor: 0,
  setup: undefined as (() => () => void) | undefined,
  setTick: vi.fn(),
}))

vi.mock('react', () => ({
  default: {
    useRef: (value: unknown) => {
      const index = hooks.cursor++
      hooks.refs[index] ??= { current: value }
      return hooks.refs[index]
    },
    useState: () => [0, hooks.setTick],
    useEffect: (setup: () => () => void) => {
      hooks.setup = setup
    },
  },
}))

function deferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
} {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function createViewModel(): IViewModel & { dispose: ReturnType<typeof vi.fn> } {
  // The hook only uses dispose and the optional display name.
  return { name: 'TestViewModel', dispose: vi.fn() } as unknown as IViewModel & {
    dispose: ReturnType<typeof vi.fn>
  }
}

function render(factory: () => IViewModel | Promise<IViewModel>): IViewModel | null {
  hooks.cursor = 0
  return useViewModel(factory)
}

async function flushCreation(): Promise<void> {
  // Drain both the fulfillment handler and its chained rejection handler.
  await Promise.resolve()
  await Promise.resolve()
}

beforeEach(() => {
  hooks.refs = []
  hooks.cursor = 0
  hooks.setup = undefined
  hooks.setTick.mockClear()
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => vi.restoreAllMocks())

describe('useViewModel creation ownership', () => {
  it('disposes a result that arrives after cleanup without publishing it', async () => {
    const creation = deferred<IViewModel>()
    const viewmodel = createViewModel()
    const factory = (): Promise<IViewModel> => creation.promise
    expect(render(factory)).toBeNull()
    hooks.setup!()()

    creation.resolve(viewmodel)
    await flushCreation()

    expect(viewmodel.dispose).toHaveBeenCalledTimes(1)
    expect(render(factory)).toBeNull()
    expect(hooks.setTick).not.toHaveBeenCalled()
  })

  it.each(['resolve', 'reject'] as const)(
    'preserves the active instance when an earlier creation finishes with %s',
    async outcome => {
      const first = deferred<IViewModel>()
      const second = deferred<IViewModel>()
      const stale = createViewModel()
      const active = createViewModel()
      const factory = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
      render(factory)
      const setup = hooks.setup!
      setup()()
      const cleanup = setup()

      second.resolve(active)
      await flushCreation()
      expect(render(factory)).toBe(active)

      if (outcome === 'resolve') first.resolve(stale)
      else first.reject(new Error('Stale creation failed'))
      await flushCreation()

      expect(render(factory)).toBe(active)
      expect(hooks.setTick).toHaveBeenCalledTimes(1)
      expect(stale.dispose).toHaveBeenCalledTimes(outcome === 'resolve' ? 1 : 0)
      expect(active.dispose).not.toHaveBeenCalled()

      cleanup()
      expect(active.dispose).toHaveBeenCalledTimes(1)
      expect(render(factory)).toBeNull()
    },
  )
})
