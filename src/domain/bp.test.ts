import { classifyBp, bpLabel, bpAverage, countHighDays, isValidBp } from './bp'

describe('classifyBp', () => {
  it('clasifică după pragurile planului', () => {
    expect(classifyBp(126, 78)).toBe('normal')
    expect(classifyBp(132, 78)).toBe('atentie')
    expect(classifyBp(126, 84)).toBe('atentie')
    expect(classifyBp(140, 85)).toBe('ridicata')
    expect(classifyBp(128, 90)).toBe('ridicata')
    expect(classifyBp(181, 90)).toBe('consult')
    expect(classifyBp(150, 121)).toBe('consult')
  })
  it('are etichete românești', () => {
    expect(bpLabel('normal')).toBe('În regulă')
    expect(bpLabel('consult')).toBe('Consult medical')
  })
})

describe('bpAverage', () => {
  it('rotunjește la întreg', () => {
    expect(bpAverage([{ systolic: 126, diastolic: 78 }, { systolic: 129, diastolic: 81 }])).toEqual({ systolic: 128, diastolic: 80 })
  })
  it('este null fără citiri', () => {
    expect(bpAverage([])).toBeNull()
  })
})

describe('countHighDays', () => {
  it('numără zile distincte cu citiri ridicate în fereastră', () => {
    const e = [
      { date: '2026-09-01', systolic: 145, diastolic: 92 }, // în afara ferestrei de 30 zile față de 10 oct
      { date: '2026-09-20', systolic: 141, diastolic: 88 },
      { date: '2026-09-20', systolic: 142, diastolic: 89 }, // aceeași zi
      { date: '2026-10-01', systolic: 128, diastolic: 82 },
      { date: '2026-10-09', systolic: 139, diastolic: 91 },
    ]
    expect(countHighDays(e, '2026-10-10')).toBe(2)
  })
})

describe('isValidBp', () => {
  it('respectă limitele și cere sistolica peste diastolică', () => {
    expect(isValidBp(126, 78)).toBe(true)
    expect(isValidBp(126, 78, 64)).toBe(true)
    expect(isValidBp(59, 40)).toBe(false)
    expect(isValidBp(120, 151)).toBe(false)
    expect(isValidBp(120, 120)).toBe(false)
    expect(isValidBp(126, 78, 20)).toBe(false)
  })
})
