import { useEffect, useState } from 'react'
import { PinPad } from '@/ui/PinPad'
import { verifyPin, failureDelayMs } from '@/domain/pin'
import { useLock } from '@/app/store/lock'

export interface LockScreenProps {
  pinHash: string
  pinSalt: string
}

export function LockScreen({ pinHash, pinSalt }: LockScreenProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [waitMs, setWaitMs] = useState(0)
  const failedAttempts = useLock((s) => s.failedAttempts)
  const unlock = useLock((s) => s.unlock)
  const registerFailure = useLock((s) => s.registerFailure)

  useEffect(() => {
    if (waitMs <= 0) return
    const t = setTimeout(() => setWaitMs(0), waitMs)
    return () => clearTimeout(t)
  }, [waitMs])

  async function submit() {
    const ok = await verifyPin(pin, pinHash, pinSalt)
    if (ok) {
      unlock()
      return
    }
    registerFailure()
    setPin('')
    setError('PIN greșit')
    const delay = failureDelayMs(failedAttempts + 1)
    if (delay > 0) setWaitMs(delay)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Blocat</p>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight">90 Day Fit</h1>
      </div>
      <PinPad
        value={pin}
        onChange={(v) => {
          setPin(v)
          setError(null)
        }}
        onSubmit={submit}
        disabled={waitMs > 0}
      />
      <p role="status" className="min-h-6 text-sm font-bold text-accent">
        {waitMs > 0 ? `Așteaptă ${Math.ceil(waitMs / 1000)} secunde` : error}
      </p>
    </main>
  )
}
