import {
  PROGRAMS,
  cardioMinutesForWeek,
  formatSeconds,
  isDeloadWeek,
  nextGymDay,
  plannedSets,
  programForDate,
  sessionEyebrow,
  sleepRule,
  suggestNextWeight,
} from './workouts'

describe('programele', () => {
  it('au câte 7 exerciții și zile fixe', () => {
    expect(PROGRAMS.A.exercises).toHaveLength(7)
    expect(PROGRAMS.B.exercises).toHaveLength(7)
    expect(PROGRAMS.C.exercises).toHaveLength(7)
    expect(programForDate('2026-09-07')).toBe('A') // luni
    expect(programForDate('2026-09-09')).toBe('B') // miercuri
    expect(programForDate('2026-09-11')).toBe('C') // vineri
    expect(programForDate('2026-09-08')).toBeNull()
    expect(programForDate('2026-09-13')).toBeNull()
  })

  it('găsește următoarea zi de sală', () => {
    expect(nextGymDay('2026-09-08')).toEqual({ date: '2026-09-09', program: 'B' })
    expect(nextGymDay('2026-09-11')).toEqual({ date: '2026-09-14', program: 'A' })
  })
})

describe('regula somnului', () => {
  it('clasifică orele', () => {
    expect(sleepRule(undefined)).toBe('normal')
    expect(sleepRule(6)).toBe('normal')
    expect(sleepRule(5)).toBe('normal')
    expect(sleepRule(4.5)).toBe('reduced')
    expect(sleepRule(3.9)).toBe('walk')
  })
})

describe('seturi și cardio pe săptămâni', () => {
  const legPress = PROGRAMS.A.exercises[0]!
  const splitSquat = PROGRAMS.A.exercises[3]!
  it('limitează la 2 în adaptare și descărcare', () => {
    expect(plannedSets(legPress, 1, 'normal')).toBe(2)
    expect(plannedSets(legPress, 4, 'normal')).toBe(3)
    expect(plannedSets(legPress, 7, 'normal')).toBe(2)
    expect(isDeloadWeek(13)).toBe(true)
  })
  it('scade un set la somn redus și zero la mers', () => {
    expect(plannedSets(legPress, 4, 'reduced')).toBe(2)
    expect(plannedSets(legPress, 1, 'reduced')).toBe(1)
    expect(plannedSets(legPress, 4, 'walk')).toBe(0)
  })
  it('respectă exercițiile care intră mai târziu', () => {
    expect(plannedSets(splitSquat, 2, 'normal')).toBe(0)
    expect(plannedSets(splitSquat, 3, 'normal')).toBe(2)
    expect(plannedSets(splitSquat, 0, 'normal')).toBe(2)
  })
  it('cardio după plan', () => {
    expect(cardioMinutesForWeek(1)).toBe(10)
    expect(cardioMinutesForWeek(3)).toBe(15)
    expect(cardioMinutesForWeek(5)).toBe(20)
    expect(cardioMinutesForWeek(7)).toBe(15)
    expect(cardioMinutesForWeek(9)).toBe(25)
    expect(cardioMinutesForWeek(9, 'reduced')).toBe(0)
    expect(cardioMinutesForWeek(9, 'walk')).toBe(20)
  })
})

describe('progresia', () => {
  const legPress = PROGRAMS.A.exercises[0]!
  const chest = PROGRAMS.A.exercises[1]!
  it('fără istoric cere o greutate de start', () => {
    expect(suggestNextWeight(chest, []).weightKg).toBeNull()
  })
  it('păstrează greutatea dacă nu s-a atins limita de sus', () => {
    const s = suggestNextWeight(chest, [{ weightKg: 40, reps: 12 }, { weightKg: 40, reps: 11 }])
    expect(s.weightKg).toBe(40)
  })
  it('crește cu 2,5 kg sau 5% la presă', () => {
    expect(suggestNextWeight(chest, [{ weightKg: 40, reps: 12 }, { weightKg: 40, reps: 12 }]).weightKg).toBe(42.5)
    expect(suggestNextWeight(legPress, [{ weightKg: 140, reps: 12 }, { weightKg: 140, reps: 12 }, { weightKg: 140, reps: 12 }]).weightKg).toBe(147)
  })
})

describe('formatări', () => {
  it('secunde → m:ss', () => {
    expect(formatSeconds(90)).toBe('1:30')
    expect(formatSeconds(5)).toBe('0:05')
    expect(formatSeconds(-3)).toBe('0:00')
  })
  it('antetul sesiunii', () => {
    expect(sessionEyebrow('2026-09-30', 'B')).toBe('Miercuri · Ziua B · Săptămâna 4')
    expect(sessionEyebrow('2026-09-04', 'A')).toBe('Vineri · Ziua A')
  })
})
