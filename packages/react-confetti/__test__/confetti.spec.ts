import { afterEach, expect, it, vi } from 'vitest'
import { commit, render, unmount } from '../../react-hooks/__test__/fixtures/hooks'
import { useThrowRandomConfetti } from '../src'

const instances = vi.hoisted(() => ({
  current: [] as Array<{
    addConfetti: ReturnType<typeof vi.fn>
    clearCanvas: ReturnType<typeof vi.fn>
    destroyCanvas: ReturnType<typeof vi.fn>
  }>,
}))

vi.mock('react', async () => {
  const { react } = await import('../../react-hooks/__test__/fixtures/hooks')
  return { default: react, ...react }
})

vi.mock('js-confetti', () => ({
  default: class {
    public addConfetti = vi.fn().mockResolvedValue(undefined)
    public clearCanvas = vi.fn()
    public destroyCanvas = vi.fn()

    public constructor() {
      instances.current.push(this)
    }
  },
}))

afterEach(() => {
  unmount()
  instances.current = []
  vi.unstubAllGlobals()
})

it.each([undefined, 600, 1200])('uses the appropriate particle size for width %s', async width => {
  if (width !== undefined) vi.stubGlobal('window', { screen: { width } })
  const throwConfetti = render(() => useThrowRandomConfetti())
  await throwConfetti()
  expect(instances.current).toHaveLength(0)
  commit()
  const confetti = instances.current[0]
  await throwConfetti()
  expect(confetti.addConfetti).toHaveBeenCalledWith({
    confettiColors: expect.any(Array),
    confettiRadius: width === 1200 ? 8 : 4,
    confettiNumber: width === 1200 ? 300 : 100,
  })
  unmount()
  expect(confetti.clearCanvas).toHaveBeenCalledOnce()
  expect(confetti.destroyCanvas).toHaveBeenCalledOnce()
  await throwConfetti()
  expect(confetti.addConfetti).toHaveBeenCalledOnce()
})

it('releases the canvas even when the animation rejects', async () => {
  const throwConfetti = render(() => useThrowRandomConfetti())
  commit()
  const confetti = instances.current[0]
  confetti.addConfetti.mockRejectedValueOnce(new Error('Animation failed'))
  await expect(throwConfetti()).rejects.toThrow('Animation failed')
  await expect(throwConfetti()).resolves.toBeUndefined()
  unmount()
  expect(confetti.clearCanvas).toHaveBeenCalledOnce()
  expect(confetti.destroyCanvas).toHaveBeenCalledOnce()
})

it('settles all pending animations when the hook unmounts', async () => {
  const throwConfetti = render(() => useThrowRandomConfetti())
  commit()
  const confetti = instances.current[0]
  confetti.addConfetti.mockImplementation(() => new Promise<void>(() => {}))

  const settled = vi.fn()
  void Promise.allSettled([throwConfetti(), throwConfetti()]).then(settled)
  expect(confetti.addConfetti).toHaveBeenCalledTimes(2)

  unmount()
  await new Promise<void>(resolve => setTimeout(resolve, 0))

  expect(settled).toHaveBeenCalledWith([
    { status: 'fulfilled', value: undefined },
    { status: 'fulfilled', value: undefined },
  ])
  expect(confetti.clearCanvas).toHaveBeenCalledOnce()
  expect(confetti.destroyCanvas).toHaveBeenCalledOnce()
})

it('waits for normal animation completion while mounted', async () => {
  const throwConfetti = render(() => useThrowRandomConfetti())
  commit()
  const confetti = instances.current[0]
  let complete!: () => void
  confetti.addConfetti.mockReturnValueOnce(
    new Promise<void>(resolve => {
      complete = resolve
    }),
  )

  const animation = throwConfetti()
  const settled = vi.fn()
  void animation.then(settled)
  await new Promise<void>(resolve => setTimeout(resolve, 0))
  expect(settled).not.toHaveBeenCalled()

  complete()
  await expect(animation).resolves.toBeUndefined()
  expect(settled).toHaveBeenCalledOnce()
})

it('handles late animation rejection after unmount', async () => {
  const throwConfetti = render(() => useThrowRandomConfetti())
  commit()
  const confetti = instances.current[0]
  let reject!: (reason: Error) => void
  confetti.addConfetti.mockReturnValueOnce(
    new Promise<void>((_, rejectPromise) => {
      reject = rejectPromise
    }),
  )

  const animation = throwConfetti()
  unmount()
  await expect(animation).resolves.toBeUndefined()

  reject(new Error('Late animation failure'))
  await new Promise<void>(resolve => setTimeout(resolve, 0))
})

it('preserves synchronous animation errors and remains reusable', async () => {
  const throwConfetti = render(() => useThrowRandomConfetti())
  commit()
  instances.current[0].addConfetti.mockImplementationOnce(() => {
    throw new Error('Animation setup failed')
  })

  await expect(throwConfetti()).rejects.toThrow('Animation setup failed')
  await expect(throwConfetti()).resolves.toBeUndefined()
})
