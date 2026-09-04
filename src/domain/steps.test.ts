import { stepTargetForDate, weeklyStepAverage, stepsPercent } from './steps'

describe('stepTargetForDate', () => {
  it('urmează treptele planului', () => {
    expect(stepTargetForDate('2026-09-07')).toBe(6000)
    expect(stepTargetForDate('2026-09-30')).toBe(7500)
    expect(stepTargetForDate('2026-10-05')).toBe(9000)
    expect(stepTargetForDate('2026-11-02')).toBe(10000)
  })
  it('folosește prima treaptă înainte de start', () => {
    expect(stepTargetForDate('2026-09-03')).toBe(6000)
  })
})

describe('weeklyStepAverage', () => {
  it('face media valorilor existente din 7 zile', () => {
    const e = [
      { date: '2026-09-14', count: 5000 },
      { date: '2026-09-16', count: 7000 },
      { date: '2026-09-20', count: 9000 },
      { date: '2026-09-21', count: 100000 },
    ]
    expect(weeklyStepAverage(e, '2026-09-20')).toBe(7000)
  })
  it('este null fără date', () => {
    expect(weeklyStepAverage([], '2026-09-20')).toBeNull()
  })
})

describe('stepsPercent', () => {
  it('plafonează la 100', () => {
    expect(stepsPercent(6240, 7500)).toBe(83)
    expect(stepsPercent(9000, 7500)).toBe(100)
  })
})
