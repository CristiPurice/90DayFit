import { useCallback, useEffect, useState } from 'react'

export interface RestTimer {
  remaining: number
  total: number
  running: boolean
  start: (seconds: number) => void
  add: (seconds: number) => void
  skip: () => void
}

function vibrate() {
  try {
    navigator.vibrate?.([200, 100, 200])
  } catch {
    /* unele browsere aruncă la vibrate fără gest; ignorăm */
  }
}

/** Cronometru de pauză între seturi. Vibrează când ajunge la zero. */
export function useRestTimer(): RestTimer {
  const [total, setTotal] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false)
      vibrate()
    }
  }, [running, remaining])

  const start = useCallback((seconds: number) => {
    setTotal(seconds)
    setRemaining(seconds)
    setRunning(seconds > 0)
  }, [])

  const add = useCallback((seconds: number) => {
    setTotal((t) => t + seconds)
    setRemaining((r) => r + seconds)
    setRunning(true)
  }, [])

  const skip = useCallback(() => {
    setRunning(false)
    setRemaining(0)
    setTotal(0)
  }, [])

  return { remaining, total, running, start, add, skip }
}
