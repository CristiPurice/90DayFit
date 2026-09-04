import { sevenDayAverage, weeklyRate, weightProgress } from './weight'

const series = [
  { date: '2026-09-07', kg: 130 },
  { date: '2026-09-08', kg: 129.6 },
  { date: '2026-09-09', kg: 129.2 },
  { date: '2026-09-10', kg: 129.4 },
  { date: '2026-09-11', kg: 128.9 },
  { date: '2026-09-12', kg: 128.7 },
  { date: '2026-09-13', kg: 128.5 },
  { date: '2026-09-14', kg: 128.4 },
  { date: '2026-09-16', kg: 127.9 },
  { date: '2026-09-18', kg: 127.6 },
  { date: '2026-09-20', kg: 127.2 },
]

describe('sevenDayAverage', () => {
  it('face media valorilor existente din ultimele 7 zile', () => {
    // 14..20 sept: 128.4, 127.9, 127.6, 127.2 → 127.775 → 127,8
    expect(sevenDayAverage(series, '2026-09-20')).toBe(127.8)
  })
  it('include ziua curentă și exclude ziua a 8-a', () => {
    // 7..13 sept: toate cele 7 valori
    expect(sevenDayAverage(series, '2026-09-13')).toBe(129.2)
  })
  it('returnează null fără date', () => {
    expect(sevenDayAverage([], '2026-09-20')).toBeNull()
    expect(sevenDayAverage(series, '2026-08-01')).toBeNull()
  })
})

describe('weeklyRate', () => {
  it('compară media curentă cu cea anterioară', () => {
    // curent 14..20: 127.775; anterior 7..13: 129.186 → −1.41 → −1,4
    expect(weeklyRate(series, '2026-09-20')).toBe(-1.4)
  })
  it('este null când lipsește una dintre săptămâni', () => {
    expect(weeklyRate(series, '2026-09-13')).toBeNull()
  })
})

describe('weightProgress', () => {
  it('calculează pierdut, rămas și procent', () => {
    expect(weightProgress(130, 115, 124.8)).toEqual({ lostKg: 5.2, remainingKg: 9.8, percent: 35 })
  })
  it('plafonează procentul la 0 și 100', () => {
    expect(weightProgress(130, 115, 131).percent).toBe(0)
    expect(weightProgress(130, 115, 110).percent).toBe(100)
  })
  it('nu împarte la zero când ținta e egală cu startul', () => {
    expect(weightProgress(120, 120, 118).percent).toBe(0)
  })
})
