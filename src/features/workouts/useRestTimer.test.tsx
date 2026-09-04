import { act, renderHook } from '@testing-library/react'
import { useRestTimer } from './useRestTimer'

describe('useRestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('numără invers și se oprește la zero', () => {
    const { result } = renderHook(() => useRestTimer())
    act(() => result.current.start(3))
    expect(result.current.remaining).toBe(3)
    expect(result.current.running).toBe(true)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.remaining).toBe(1)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.remaining).toBe(0)
    expect(result.current.running).toBe(false)
  })

  it('adaugă 30 s și poate fi sărit', () => {
    const { result } = renderHook(() => useRestTimer())
    act(() => result.current.start(10))
    act(() => result.current.add(30))
    expect(result.current.remaining).toBe(40)
    expect(result.current.total).toBe(40)
    act(() => result.current.skip())
    expect(result.current.remaining).toBe(0)
    expect(result.current.running).toBe(false)
  })
})
