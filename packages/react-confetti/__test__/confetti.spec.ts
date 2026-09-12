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
