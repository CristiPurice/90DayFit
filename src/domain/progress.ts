import { PLAN, addDays, dayNumber, weekNumber } from './plan'
import { sevenDayAverage } from './weight'
import { countHighDays } from './bp'
import { stepTargetForWeek } from './plan'

export interface WeekRange {
  from: string
  to: string
}

/** Intervalul calendaristic al săptămânii N a planului (luni → duminică). */
export function weekRange(weekNo: number, startDate: string = PLAN.startDate): WeekRange {
  const from = addDays(startDate, (weekNo - 1) * 7)
  return { from, to: addDays(from, 6) }
}

export interface WeightPoint {
  date: string
  day: number
  kg: number
  avg: number | null
}

/** Seria pentru grafic: fiecare cântărire cu media pe 7 zile la acea dată. */
export function weightSeries(entries: { date: string; kg: number }[], startDate: string = PLAN.startDate): WeightPoint[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  return sorted.map((e) => ({ date: e.date, day: dayNumber(e.date, startDate), kg: e.kg, avg: sevenDayAverage(sorted, e.date) }))
}

export interface BpPoint {
  date: string
  slot: 'am' | 'pm'
  label: string
  systolic: number
  diastolic: number
}

export function bpSeries(entries: { date: string; slot: 'am' | 'pm'; systolic: number; diastolic: number }[]): BpPoint[] {
  return [...entries]
    .sort((a, b) => a.date.localeCompare(b.date) || (a.slot === 'am' ? -1 : 1))
    .map((e) => ({ date: e.date, slot: e.slot, label: `${e.date.slice(8)}.${e.date.slice(5, 7)} ${e.slot === 'am' ? 'AM' : 'PM'}`, systolic: e.systolic, diastolic: e.diastolic }))
}

export interface WeekBucket {
  weekNo: number
  from: string
  to: string
}

/** Săptămânile planului de la 1 până la cea care conține `today` (maximum 13). */
export function weeksUntil(today: string, startDate: string = PLAN.startDate): WeekBucket[] {
  const current = Math.min(PLAN.totalWeeks, Math.max(0, weekNumber(today, startDate)))
  const out: WeekBucket[] = []
  for (let w = 1; w <= current; w++) out.push({ weekNo: w, ...weekRange(w, startDate) })
  return out
}

function inRange(date: string, r: WeekRange): boolean {
  return date >= r.from && date <= r.to
}

export type Trend = 'up' | 'flat' | 'down'

export interface WeekMetrics {
  weekNo: number
  from: string
  to: string
  avgKg: number | null
  prevAvgKg: number | null
  /** media săptămânii − media săptămânii anterioare; negativ = scădere */
  rateKg: number | null
  weighIns: number
  mealsFollowed: number
  mealsTotal: number
  workoutsDone: number
  avgSteps: number | null
  stepTarget: number
  nightsUnder5: number
  highBpDays30: number
  waistCm: number | null
  waistPrevCm: number | null
  volumeKg: number
  prevVolumeKg: number
  strengthTrend: Trend | null
}

export interface WeekInput {
  weights: { date: string; kg: number }[]
  meals: { date: string; followed: boolean }[]
  workouts: { date: string; completed: boolean; sleepHours?: number }[]
  sets: { date: string; weightKg: number; reps: number }[]
  steps: { date: string; count: number }[]
  bp: { date: string; systolic: number; diastolic: number }[]
  waist: { date: string; cm: number }[]
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function avgOf(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((s, v) => s + v, 0) / values.length
}

/** Toate cifrele unei săptămâni, calculate din datele brute. */
export function weekMetrics(weekNo: number, data: WeekInput, startDate: string = PLAN.startDate): WeekMetrics {
  const r = weekRange(weekNo, startDate)
  const prev = weekRange(weekNo - 1, startDate)

  const kgThis = data.weights.filter((w) => inRange(w.date, r)).map((w) => w.kg)
  const kgPrev = data.weights.filter((w) => inRange(w.date, prev)).map((w) => w.kg)
  const avgKg = avgOf(kgThis)
  const prevAvgKg = avgOf(kgPrev)

  const mealsFollowed = data.meals.filter((m) => inRange(m.date, r) && m.followed).length
  const workoutsDone = data.workouts.filter((w) => inRange(w.date, r) && w.completed).length
  const nightsUnder5 = data.workouts.filter((w) => inRange(w.date, r) && w.sleepHours !== undefined && w.sleepHours < 5).length
  const stepsThis = data.steps.filter((s) => inRange(s.date, r)).map((s) => s.count)
  const avgSteps = avgOf(stepsThis)

  const volume = (range: WeekRange) => data.sets.filter((s) => inRange(s.date, range)).reduce((v, s) => v + s.weightKg * s.reps, 0)
  const volumeKg = volume(r)
  const prevVolumeKg = volume(prev)
  let strengthTrend: Trend | null = null
  if (volumeKg > 0 && prevVolumeKg > 0) {
    const ratio = volumeKg / prevVolumeKg
    strengthTrend = ratio > 1.03 ? 'up' : ratio < 0.97 ? 'down' : 'flat'
  }

  const waistSorted = [...data.waist].sort((a, b) => a.date.localeCompare(b.date))
  const waistThis = waistSorted.filter((w) => w.date <= r.to)
  const waistCm = waistThis.length > 0 ? waistThis[waistThis.length - 1]!.cm : null
  const waistBefore = waistSorted.filter((w) => w.date < r.from)
  const waistPrevCm = waistBefore.length > 0 ? waistBefore[waistBefore.length - 1]!.cm : null

  return {
    weekNo,
    from: r.from,
    to: r.to,
    avgKg: avgKg === null ? null : round1(avgKg),
    prevAvgKg: prevAvgKg === null ? null : round1(prevAvgKg),
    rateKg: avgKg === null || prevAvgKg === null ? null : round1(avgKg - prevAvgKg),
    weighIns: kgThis.length,
    mealsFollowed,
    mealsTotal: 21,
    workoutsDone,
    avgSteps: avgSteps === null ? null : Math.round(avgSteps),
    stepTarget: stepTargetForWeek(weekNo),
    nightsUnder5,
    highBpDays30: countHighDays(data.bp, r.to, 30),
    waistCm,
    waistPrevCm,
    volumeKg: Math.round(volumeKg),
    prevVolumeKg: Math.round(prevVolumeKg),
    strengthTrend,
  }
}
