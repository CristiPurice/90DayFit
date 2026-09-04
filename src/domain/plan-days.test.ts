import { addDays, keyFromDate } from './plan'

describe('addDays', () => {
  it('trece corect peste luni și ani', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2026-09-20', -6)).toBe('2026-09-14')
  })
})

describe('keyFromDate', () => {
  it('formatează data locală', () => {
    expect(keyFromDate(new Date(2026, 8, 4))).toBe('2026-09-04')
  })
})
