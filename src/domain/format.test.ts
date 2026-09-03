import { todayKey, formatDate, formatKg, formatInt, parseDecimal } from './format'

describe('todayKey', () => {
  it('produce aaaa-ll-zz din data locală', () => {
    expect(todayKey(new Date(2026, 8, 3))).toBe('2026-09-03')
    expect(todayKey(new Date(2026, 11, 25))).toBe('2026-12-25')
  })
})

describe('formatDate', () => {
  it('afișează zz.ll.aaaa', () => {
    expect(formatDate('2026-09-07')).toBe('07.09.2026')
  })
  it('returnează intrarea dacă nu are forma așteptată', () => {
    expect(formatDate('azi')).toBe('azi')
  })
})

describe('formatKg', () => {
  it('folosește virgula și o zecimală', () => {
    expect(formatKg(124.8)).toBe('124,8')
    expect(formatKg(125)).toBe('125,0')
    expect(formatKg(124.86, 2)).toBe('124,86')
  })
})

describe('formatInt', () => {
  it('separă miile cu punct', () => {
    expect(formatInt(6240)).toBe('6.240')
    expect(formatInt(999)).toBe('999')
    expect(formatInt(10000.4)).toBe('10.000')
  })
})

describe('parseDecimal', () => {
  it('acceptă virgulă și punct', () => {
    expect(parseDecimal('124,8')).toBe(124.8)
    expect(parseDecimal('124.8')).toBe(124.8)
    expect(parseDecimal(' 130 ')).toBe(130)
  })
  it('respinge textul', () => {
    expect(parseDecimal('abc')).toBeNull()
    expect(parseDecimal('')).toBeNull()
    expect(parseDecimal('12,3,4')).toBeNull()
  })
})
