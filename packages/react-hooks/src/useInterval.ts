import React from 'react'

type ICallback = () => void

/**
 * Execute callback interval in react function components.
 * @param callback
 * @param duration
 */
export function useInterval(callback: ICallback, duration: number): void {
  const callbackRef = React.useRef<ICallback>(callback)

  React.useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  React.useEffect(() => {
    const tick: ICallback = () => {
      if (callbackRef.current === undefined) return
      callbackRef.current()
    }
    const intervalId = setInterval(tick, duration)
    return () => clearInterval(intervalId)
  }, [duration])
}
