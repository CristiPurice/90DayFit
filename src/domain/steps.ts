import { PLAN, addDays, stepTargetForWeek, weekNumber } from './plan'

export const STEPS_MAX_PER_DAY = 60000

export interface StepsPoint {
  date: string
  count: number
}

/** Ținta de pași pentru o zi, după săptămâna planului. Înainte de start: prima treaptă. */
export function stepTargetForDate(dateKey: string, startDate: string = PLAN.startDate): number {
  return stepTargetForWeek(weekNumber(dateKey, startDate))
}

/** Media pașilor din ultimele 7 zile, din valorile existente. */
export function weeklyStepAverage(entries: StepsPoint[], dateKey: string): number | null {
  const from = addDays(dateKey, -6)
  const inRange = entries.filter((e) => e.date >= from && e.date <= dateKey)
  if (inRange.length === 0) return null
  return Math.round(inRange.reduce((s, e) => s + e.count, 0) / inRange.length)
}

/** Procent din țintă, plafonat la 100. */
export function stepsPercent(count: number, target: number): number {
  if (target <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((count / target) * 100)))
}
