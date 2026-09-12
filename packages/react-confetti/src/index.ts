import { useEventCallback } from '@guanghechen/react-hooks'
import JSConfetti from 'js-confetti'
import { useEffect, useRef } from 'react'

type IAddConfettiConfig = Exclude<Parameters<JSConfetti['addConfetti']>[0], undefined>

const confettiColorsSet: Array<IAddConfettiConfig['confettiColors']> = [
  ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'],
  ['#9b5de5', '#f15bb5', '#fee440', '#00bbf9', '#00f5d4'],
]

const randomConfettiColors = (): IAddConfettiConfig['confettiColors'] => {
  const N: number = confettiColorsSet.length
  const idx = Math.min(N - 1, Math.floor(Math.random() * N))
  return confettiColorsSet[idx]
}

/**
 * Each call resolves when its animation completes or the hook unmounts.
 * Animation errors still reject the returned Promise.
 */
export const useThrowRandomConfetti = (): (() => Promise<void>) => {
  const pendingRef = useRef(new Set<() => void>())
  const confettiRef = useRef<JSConfetti | null>(null)

  useEffect(() => {
    const confetti = new JSConfetti()
    confettiRef.current = confetti
    return () => {
      confettiRef.current = null
      for (const cancel of pendingRef.current) cancel()
      pendingRef.current.clear()
      confetti.clearCanvas()
      confetti.destroyCanvas()
    }
  }, [])

  const throwConfetti = useEventCallback(async (): Promise<void> => {
    if (confettiRef.current == null) return

    const confetti = confettiRef.current
    const confettiColors = randomConfettiColors()

    const xs: boolean = typeof window === 'undefined' ? true : window.screen.width <= 900
    const config: IAddConfettiConfig = {
      confettiColors,
      confettiRadius: xs ? 4 : 8,
      confettiNumber: xs ? 100 : 300,
    }

    let cancel!: () => void
    const cancelled = new Promise<void>(resolve => {
      cancel = resolve
    })
    pendingRef.current.add(cancel)
    try {
      await Promise.race([confetti.addConfetti(config), cancelled])
    } finally {
      pendingRef.current.delete(cancel)
    }
  })
  return throwConfetti
}
