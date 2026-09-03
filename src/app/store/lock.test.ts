import { useLock, shouldLock, LOCK_TIMEOUT_MS } from './lock'

describe('shouldLock', () => {
  it('blochează după timeout și nu înainte', () => {
    expect(shouldLock(0, LOCK_TIMEOUT_MS)).toBe(true)
    expect(shouldLock(0, LOCK_TIMEOUT_MS + 1)).toBe(true)
    expect(shouldLock(0, 1000)).toBe(false)
  })
})

describe('useLock', () => {
  beforeEach(() => {
    useLock.setState({ locked: true, failedAttempts: 0, lastActiveAt: 0 })
  })

  it('pornește blocat și se deblochează', () => {
    expect(useLock.getState().locked).toBe(true)
    useLock.getState().unlock()
    expect(useLock.getState().locked).toBe(false)
  })

  it('unlock resetează încercările greșite', () => {
    useLock.getState().registerFailure()
    useLock.getState().registerFailure()
    expect(useLock.getState().failedAttempts).toBe(2)
    useLock.getState().unlock()
    expect(useLock.getState().failedAttempts).toBe(0)
  })

  it('lock și touch actualizează starea', () => {
    useLock.getState().unlock()
    useLock.getState().lock()
    expect(useLock.getState().locked).toBe(true)
    useLock.getState().touch(12345)
    expect(useLock.getState().lastActiveAt).toBe(12345)
  })
})
