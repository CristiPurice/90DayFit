/** Constantele planului de 90 de zile. Sursa: plan-transformare-90-zile.md */
export const PLAN = {
  startDate: '2026-09-07',
  endDate: '2026-12-06',
  startKg: 130,
  targetKg: 115,
  waistStartCm: 115,
  calorieTarget: 2400,
  calorieMin: 2100,
  proteinMinG: 170,
  proteinMaxG: 200,
  waterTargetMl: 3000,
  totalWeeks: 13,
  stepTargets: [
    { fromWeek: 1, steps: 6000 },
    { fromWeek: 3, steps: 7500 },
    { fromWeek: 5, steps: 9000 },
    { fromWeek: 9, steps: 10000 },
  ],
} as const

const MS_PER_DAY = 24 * 60 * 60 * 1000
const pad2 = (n: number) => String(n).padStart(2, '0')

/** Interpretează 'aaaa-ll-zz' ca dată locală la miezul nopții. */
export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) throw new Error(`Cheie de dată invalidă: ${key}`)
  return new Date(y, m - 1, d)
}

/** Data locală → 'aaaa-ll-zz'. */
export function keyFromDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Adaugă (sau scade) zile calendaristice unei chei de dată. */
export function addDays(dateKey: string, delta: number): string {
  const d = dateFromKey(dateKey)
  d.setDate(d.getDate() + delta)
  return keyFromDate(d)
}

/** Ziua planului: 1 la data de start, 91 la final. Sub 1 înainte de start. */
export function dayNumber(dateKey: string, startDate: string = PLAN.startDate): number {
  const diff = dateFromKey(dateKey).getTime() - dateFromKey(startDate).getTime()
  return Math.round(diff / MS_PER_DAY) + 1
}

/** Săptămâna planului: 1..13. 0 înainte de start, 14+ după final. */
export function weekNumber(dateKey: string, startDate: string = PLAN.startDate): number {
  const day = dayNumber(dateKey, startDate)
  if (day < 1) return 0
  return Math.floor((day - 1) / 7) + 1
}

/** Ținta de pași pentru o săptămână a planului. */
export function stepTargetForWeek(week: number): number {
  let target: number = PLAN.stepTargets[0].steps
  for (const t of PLAN.stepTargets) {
    if (week >= t.fromWeek) target = t.steps
  }
  return target
}
