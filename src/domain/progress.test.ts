import { bpSeries, weekMetrics, weekRange, weeksUntil, weightSeries, type WeekInput } from './progress'
import { prefillAnswers, weeklyDecision } from './review'

const empty: WeekInput = { weights: [], meals: [], workouts: [], sets: [], steps: [], bp: [], waist: [] }

describe('weekRange / weeksUntil', () => {
  it('săptămâna 1 e 7–13 sept, săptămâna 4 e 28 sept–4 oct', () => {
    expect(weekRange(1)).toEqual({ from: '2026-09-07', to: '2026-09-13' })
    expect(weekRange(4)).toEqual({ from: '2026-09-28', to: '2026-10-04' })
  })
  it('listează săptămânile până azi, maximum 13', () => {
    expect(weeksUntil('2026-09-04')).toEqual([])
    expect(weeksUntil('2026-09-30').map((w) => w.weekNo)).toEqual([1, 2, 3, 4])
    expect(weeksUntil('2027-01-01').length).toBe(13)
  })
})

describe('serii pentru grafice', () => {
  it('greutatea cu media pe 7 zile și ziua planului', () => {
    const s = weightSeries([
      { date: '2026-09-08', kg: 129 },
      { date: '2026-09-07', kg: 130 },
    ])
    expect(s.map((p) => [p.day, p.kg, p.avg])).toEqual([
      [1, 130, 130],
      [2, 129, 129.5],
    ])
  })
  it('tensiunea ordonată cronologic, AM înaintea PM', () => {
    const s = bpSeries([
      { date: '2026-09-08', slot: 'pm', systolic: 124, diastolic: 80 },
      { date: '2026-09-08', slot: 'am', systolic: 126, diastolic: 78 },
    ])
    expect(s.map((p) => p.label)).toEqual(['08.09 AM', '08.09 PM'])
  })
})

describe('weekMetrics', () => {
  const data: WeekInput = {
    weights: [
      { date: '2026-09-21', kg: 127.6 },
      { date: '2026-09-24', kg: 127.2 },
      { date: '2026-09-28', kg: 126.4 },
      { date: '2026-09-30', kg: 126.0 },
      { date: '2026-10-03', kg: 125.6 },
    ],
    meals: [
      { date: '2026-09-28', followed: true },
      { date: '2026-09-28', followed: true },
      { date: '2026-09-29', followed: false },
      { date: '2026-10-05', followed: true },
    ],
    workouts: [
      { date: '2026-09-28', completed: true, sleepHours: 4.5 },
      { date: '2026-09-30', completed: true, sleepHours: 6 },
      { date: '2026-10-02', completed: false },
    ],
    sets: [
      { date: '2026-09-23', weightKg: 100, reps: 10 },
      { date: '2026-09-28', weightKg: 100, reps: 12 },
      { date: '2026-09-30', weightKg: 50, reps: 10 },
    ],
    steps: [
      { date: '2026-09-28', count: 7000 },
      { date: '2026-09-29', count: 8000 },
    ],
    bp: [
      { date: '2026-09-15', systolic: 145, diastolic: 92 },
      { date: '2026-09-29', systolic: 126, diastolic: 78 },
    ],
    waist: [
      { date: '2026-09-27', cm: 112 },
      { date: '2026-10-04', cm: 110.5 },
    ],
  }

  it('calculează toate cifrele săptămânii 4', () => {
    const m = weekMetrics(4, data)
    expect(m.from).toBe('2026-09-28')
    expect(m.avgKg).toBe(126)
    expect(m.prevAvgKg).toBe(127.4)
    expect(m.rateKg).toBe(-1.4)
    expect(m.weighIns).toBe(3)
    expect(m.mealsFollowed).toBe(2)
    expect(m.workoutsDone).toBe(2)
    expect(m.nightsUnder5).toBe(1)
    expect(m.avgSteps).toBe(7500)
    expect(m.stepTarget).toBe(7500)
    expect(m.highBpDays30).toBe(1)
    expect(m.waistCm).toBe(110.5)
    expect(m.waistPrevCm).toBe(112)
    expect(m.volumeKg).toBe(1700)
    expect(m.prevVolumeKg).toBe(1000)
    expect(m.strengthTrend).toBe('up')
  })

  it('fără date returnează null-uri și zerouri', () => {
    const m = weekMetrics(4, empty)
    expect(m.avgKg).toBeNull()
    expect(m.rateKg).toBeNull()
    expect(m.mealsFollowed).toBe(0)
    expect(m.strengthTrend).toBeNull()
    expect(m.waistCm).toBeNull()
  })
})

describe('weeklyDecision', () => {
  const base = weekMetrics(4, empty)
  const with_ = (over: Partial<typeof base>) => ({ ...base, ...over })

  it('tensiunea ridicată bate orice altă regulă', () => {
    const d = weeklyDecision(with_({ highBpDays30: 3, rateKg: -1 }))
    expect(d.severity).toBe('alert')
  })
  it('săptămânile 1–2 nu ajustează', () => {
    expect(weeklyDecision(with_({ weekNo: 2, rateKg: -3 })).decision).toBe('Nimic')
  })
  it('fără medie nu decide', () => {
    expect(weeklyDecision(with_({ rateKg: null })).decision).toBe('Nimic încă')
  })
  it('ritm bun → nimic', () => {
    const d = weeklyDecision(with_({ rateKg: -1.0 }))
    expect(d.severity).toBe('ok')
    expect(d.reason).toMatch(/−1,0 kg/)
  })
  it('prea repede două săptămâni → +150', () => {
    const d = weeklyDecision(with_({ rateKg: -1.8 }), with_({ rateKg: -1.6 }))
    expect(d.decision).toBe('+150 kcal')
  })
  it('o singură săptămână prea repede → nimic', () => {
    expect(weeklyDecision(with_({ rateKg: -1.8 }), with_({ rateKg: -1.0 })).severity).toBe('ok')
  })
  it('forța scade două săptămâni → +150 și verificări', () => {
    const d = weeklyDecision(with_({ rateKg: -1.0, strengthTrend: 'down' }), with_({ strengthTrend: 'down' }))
    expect(d.decision).toMatch(/\+150 kcal, verifică/)
  })
  it('stagnare cu aderență slabă → repară aderența', () => {
    const d = weeklyDecision(with_({ rateKg: -0.2, mealsFollowed: 12 }))
    expect(d.decision).toMatch(/Rezolvă aderența/)
  })
  it('stagnare două săptămâni cu aderență bună → −150 sau pași', () => {
    const d = weeklyDecision(with_({ rateKg: -0.2, mealsFollowed: 19 }), with_({ rateKg: -0.3 }))
    expect(d.decision).toMatch(/−150 kcal sau \+1\.500 pași/)
  })
  it('stagnare dar talia scade → nimic', () => {
    const d = weeklyDecision(with_({ rateKg: -0.1, mealsFollowed: 19, waistCm: 110, waistPrevCm: 111.5 }), with_({ rateKg: -0.2 }))
    expect(d.severity).toBe('ok')
    expect(d.reason).toMatch(/talia a scăzut cu 1,5 cm/)
  })
  it('o singură săptămână de stagnare → așteaptă', () => {
    expect(weeklyDecision(with_({ rateKg: -0.3, mealsFollowed: 19 }), with_({ rateKg: -1.0 })).reason).toMatch(/nu decide/)
  })
})

describe('prefillAnswers', () => {
  it('completează întrebările măsurabile și lasă libere pe celelalte', () => {
    const a = prefillAnswers(weekMetrics(4, empty))
    expect(a).toHaveLength(10)
    expect(a[0]).toMatch(/Fără cântăriri/)
    expect(a[2]).toBe('0 din 21.')
    expect(a[7]).toBe('')
    expect(a[9]).toBe('')
  })
})
