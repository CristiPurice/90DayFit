import { create } from 'zustand'

export const LOCK_TIMEOUT_MS = 5 * 60 * 1000

/** Aplicația se blochează dacă a stat în fundal mai mult decât timeout-ul. */
export function shouldLock(lastActiveAt: number, now: number, timeoutMs = LOCK_TIMEOUT_MS): boolean {
  return now - lastActiveAt >= timeoutMs
}

export interface LockState {
  locked: boolean
  lastActiveAt: number
  failedAttempts: number
  lock: () => void
  unlock: () => void
  touch: (now?: number) => void
  registerFailure: () => void
  resetFailures: () => void
}

export const useLock = create<LockState>((set) => ({
  locked: true,
  lastActiveAt: Date.now(),
  failedAttempts: 0,
  lock: () => set({ locked: true }),
  unlock: () => set({ locked: false, failedAttempts: 0, lastActiveAt: Date.now() }),
  touch: (now = Date.now()) => set({ lastActiveAt: now }),
  registerFailure: () => set((s) => ({ failedAttempts: s.failedAttempts + 1 })),
  resetFailures: () => set({ failedAttempts: 0 }),
}))
