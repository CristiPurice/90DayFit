import { dayNumber, weekNumber, stepTargetForWeek, dateFromKey } from './plan'

describe('dateFromKey', () => {
  it('interpretează cheia ca dată locală', () => {
    const d = dateFromKey('2026-09-07')
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 8, 7])
  })
  it('aruncă la cheie invalidă', () => {
    expect(() => dateFromKey('abc')).toThrow()
  })
})

describe('dayNumber', () => {
  it('este 1 la start și 24 pe 30 septembrie', () => {
    expect(dayNumber('2026-09-07')).toBe(1)
    expect(dayNumber('2026-09-30')).toBe(24)
    expect(dayNumber('2026-12-06')).toBe(91)
  })
  it('este sub 1 înainte de start', () => {
    expect(dayNumber('2026-09-06')).toBe(0)
  })
})

describe('weekNumber', () => {
  it('numără săptămânile de la data de start', () => {
    expect(weekNumber('2026-09-07')).toBe(1)
    expect(weekNumber('2026-09-13')).toBe(1)
    expect(weekNumber('2026-09-14')).toBe(2)
    expect(weekNumber('2026-12-06')).toBe(13)
  })
  it('este 0 înainte de start', () => {
    expect(weekNumber('2026-09-06')).toBe(0)
  })
})

describe('stepTargetForWeek', () => {
  it('urcă în trepte', () => {
    expect(stepTargetForWeek(1)).toBe(6000)
    expect(stepTargetForWeek(2)).toBe(6000)
    expect(stepTargetForWeek(4)).toBe(7500)
    expect(stepTargetForWeek(5)).toBe(9000)
    expect(stepTargetForWeek(9)).toBe(10000)
    expect(stepTargetForWeek(13)).toBe(10000)
  })
  it('folosește prima treaptă pentru săptămâna 0', () => {
    expect(stepTargetForWeek(0)).toBe(6000)
  })
})
