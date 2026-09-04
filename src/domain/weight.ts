import { addDays } from './plan'

export interface WeightPoint {
  date: string
  kg: number
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** Media valorilor din intervalul [from, to] inclusiv. null dacă nu există nicio valoare. */
function averageBetween(entries: WeightPoint[], from: string, to: string): number | null {
  const inRange = entries.filter((e) => e.date >= from && e.date <= to)
  if (inRange.length === 0) return null
  const sum = inRange.reduce((s, e) => s + e.kg, 0)
  return sum / inRange.length
}

/** Media pe 7 zile calendaristice care se termină cu dateKey, din valorile existente. */
export function sevenDayAverage(entries: WeightPoint[], dateKey: string): number | null {
  const avg = averageBetween(entries, addDays(dateKey, -6), dateKey)
  return avg === null ? null : round1(avg)
}

/** Diferența dintre media ultimelor 7 zile și media celor 7 zile anterioare. Negativ = scădere. */
export function weeklyRate(entries: WeightPoint[], dateKey: string): number | null {
  const current = averageBetween(entries, addDays(dateKey, -6), dateKey)
  const previous = averageBetween(entries, addDays(dateKey, -13), addDays(dateKey, -7))
  if (current === null || previous === null) return null
  return round1(current - previous)
}

export interface WeightProgress {
  lostKg: number
  remainingKg: number
  percent: number
}

/** Cât s-a pierdut din drumul start → țintă. Procentul e plafonat la 0..100. */
export function weightProgress(startKg: number, targetKg: number, currentKg: number): WeightProgress {
  const total = startKg - targetKg
  const lost = startKg - currentKg
  const percent = total <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((lost / total) * 100)))
  return { lostKg: round1(lost), remainingKg: round1(currentKg - targetKg), percent }
}
