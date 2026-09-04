import { waterPercent, formatLiters, remainingAllowanceMl } from './water'

describe('waterPercent', () => {
  it('calculează procentul și îl plafonează', () => {
    expect(waterPercent(2100, 3000)).toBe(70)
    expect(waterPercent(3500, 3000)).toBe(100)
    expect(waterPercent(0, 3000)).toBe(0)
    expect(waterPercent(1000, 0)).toBe(0)
  })
})

describe('formatLiters', () => {
  it('afișează litri cu o zecimală și virgulă', () => {
    expect(formatLiters(2100)).toBe('2,1')
    expect(formatLiters(500)).toBe('0,5')
    expect(formatLiters(0)).toBe('0,0')
  })
})

describe('remainingAllowanceMl', () => {
  it('nu permite depășirea plafonului zilnic', () => {
    expect(remainingAllowanceMl(7800)).toBe(200)
    expect(remainingAllowanceMl(9000)).toBe(0)
  })
})
