import { addDays } from './plan'

export const BP_LIMITS = {
  systolic: { min: 60, max: 250 },
  diastolic: { min: 30, max: 150 },
  pulse: { min: 30, max: 220 },
} as const

export type BpLevel = 'normal' | 'atentie' | 'ridicata' | 'consult'

export interface BpReading {
  systolic: number
  diastolic: number
}

export interface BpDayReading extends BpReading {
  date: string
}

/** Clasificare simplă, aliniată cu pragurile din plan: 140/90 = ridicată, 180/120 = consult. */
export function classifyBp(systolic: number, diastolic: number): BpLevel {
  if (systolic >= 180 || diastolic >= 120) return 'consult'
  if (systolic >= 140 || diastolic >= 90) return 'ridicata'
  if (systolic >= 130 || diastolic >= 80) return 'atentie'
  return 'normal'
}

export function bpLabel(level: BpLevel): string {
  switch (level) {
    case 'normal':
      return 'În regulă'
    case 'atentie':
      return 'Atenție'
    case 'ridicata':
      return 'Ridicată'
    case 'consult':
      return 'Consult medical'
  }
}

/** Media citirilor, rotunjită la întreg. null fără citiri. */
export function bpAverage(entries: BpReading[]): BpReading | null {
  if (entries.length === 0) return null
  const s = entries.reduce((a, e) => a + e.systolic, 0) / entries.length
  const d = entries.reduce((a, e) => a + e.diastolic, 0) / entries.length
  return { systolic: Math.round(s), diastolic: Math.round(d) }
}

/** Câte zile distincte din ultimele `days` au avut cel puțin o citire ridicată sau peste. */
export function countHighDays(entries: BpDayReading[], dateKey: string, days = 30): number {
  const from = addDays(dateKey, -(days - 1))
  const highDays = new Set<string>()
  for (const e of entries) {
    if (e.date < from || e.date > dateKey) continue
    const level = classifyBp(e.systolic, e.diastolic)
    if (level === 'ridicata' || level === 'consult') highDays.add(e.date)
  }
  return highDays.size
}

export function isValidBp(systolic: number, diastolic: number, pulse?: number): boolean {
  const okS = systolic >= BP_LIMITS.systolic.min && systolic <= BP_LIMITS.systolic.max
  const okD = diastolic >= BP_LIMITS.diastolic.min && diastolic <= BP_LIMITS.diastolic.max
  const okP = pulse === undefined || (pulse >= BP_LIMITS.pulse.min && pulse <= BP_LIMITS.pulse.max)
  return okS && okD && okP && systolic > diastolic
}
