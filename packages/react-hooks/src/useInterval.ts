import { useEffect, useRef } from 'react'

type ICallback = () => void

/**
 * Execute callback interval in react function components.
 * @param callback
 * @param duration
 */
export function useInterval(callback: ICallback, duration: number): void {
  const callbackRef = useRef<ICallback>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const tick: ICallback = () => {
      if (callbackRef.current === undefined) return
      callbackRef.current()
    }
    const intervalId = setInterval(tick, duration)
    return () => clearInterval(intervalId)
  }, [duration])
}
