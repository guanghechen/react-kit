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

export const useThrowRandomConfetti = (): (() => Promise<void>) => {
  const lockRef = useRef<boolean>(false)
  const confettiRef = useRef<JSConfetti | null>(null)

  useEffect(() => {
    confettiRef.current = new JSConfetti()
    return () => {
      confettiRef.current?.clearCanvas()
      confettiRef.current = null
    }
  }, [])

  const throwConfetti = useEventCallback(async (): Promise<void> => {
    // if (lockRef.current) return
    if (confettiRef.current == null) return

    const confetti = confettiRef.current
    const confettiColors = randomConfettiColors()

    const xs: boolean = typeof window === 'undefined' ? true : window.screen.width <= 900
    const config: IAddConfettiConfig = {
      confettiColors,
      confettiRadius: xs ? 4 : 8,
      confettiNumber: xs ? 100 : 300,
    }

    lockRef.current = true
    try {
      await confetti.addConfetti(config)
    } finally {
      lockRef.current = false
    }
  })
  return throwConfetti
}
