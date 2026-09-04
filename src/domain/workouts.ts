import { dateFromKey, addDays, keyFromDate, weekNumber, PLAN } from './plan'

export type Program = 'A' | 'B' | 'C'

export interface Exercise {
  id: string
  name: string
  sets: number
  repsMin: number
  repsMax: number
  restSec: number
  /** Exercițiu cronometrat (secunde în loc de repetări). */
  timed?: boolean
  perSide?: boolean
  fromWeek?: number
  note?: string
}

export interface ProgramPlan {
  id: Program
  label: string
  weekday: number // 1 = luni
  weekdayLabel: string
  exercises: Exercise[]
}

const ex = (
  id: string,
  name: string,
  sets: number,
  repsMin: number,
  repsMax: number,
  restSec: number,
  extra: Partial<Exercise> = {},
): Exercise => ({ id, name, sets, repsMin, repsMax, restSec, ...extra })

export const PROGRAMS: Record<Program, ProgramPlan> = {
  A: {
    id: 'A',
    label: 'Ziua A',
    weekday: 1,
    weekdayLabel: 'Luni',
    exercises: [
      ex('leg-press', 'Presă de picioare', 3, 10, 12, 120, {
        note: 'Picioarele sus pe platformă, spatele lipit de spătar. Nu coborî până se ridică bazinul.',
      }),
      ex('chest-press', 'Împins la piept (aparat sau gantere, bancă înclinată)', 3, 8, 12, 90),
      ex('chest-supported-row', 'Ramat cu pieptul sprijinit', 3, 10, 12, 90, { note: 'Protejează lombara complet.' }),
      ex('split-squat', 'Fandări statice cu gantere', 2, 10, 10, 90, { perSide: true, fromWeek: 3 }),
      ex('lat-pulldown-neutral', 'Tras la piept, priză neutră', 3, 10, 12, 90),
      ex('shoulder-press-machine', 'Presă pentru umeri pe aparat', 2, 10, 12, 90),
      ex('pallof-press', 'Pallof press la cablu', 2, 10, 10, 60, { perSide: true, note: 'Anti-rotație, sigur pentru lombară.' }),
    ],
  },
  B: {
    id: 'B',
    label: 'Ziua B',
    weekday: 3,
    weekdayLabel: 'Miercuri',
    exercises: [
      ex('hip-thrust', 'Hip thrust', 3, 10, 12, 120, { note: 'Bărbia în piept, nu extinde lombara la final.' }),
      ex('goblet-squat', 'Genuflexiuni goblet cu ganteră', 3, 10, 12, 120, { note: 'Ganteră la piept, trunchi vertical.' }),
      ex('cable-chest-press', 'Împins la piept la cablu (sau flotări pe bancă înclinată)', 3, 10, 15, 90),
      ex('db-row', 'Ramat cu o ganteră, sprijinit pe bancă', 3, 10, 12, 90, { perSide: true }),
      ex('leg-curl', 'Flexii de picioare', 3, 12, 15, 60, {
        note: 'Din S8, dacă lombara a fost liniștită, poate fi înlocuit cu îndreptări românești ușoare 2 × 10.',
      }),
      ex('lateral-raise', 'Fluturări laterale cu gantere', 2, 12, 15, 60),
      ex('plank', 'Plank frontal', 3, 20, 40, 60, { timed: true, note: 'Crește timpul, nu numărul de seturi.' }),
    ],
  },
  C: {
    id: 'C',
    label: 'Ziua C',
    weekday: 5,
    weekdayLabel: 'Vineri',
    exercises: [
      ex('leg-press', 'Presă de picioare', 3, 12, 15, 120, { note: 'Mai multe repetări decât luni, greutate mai mică.' }),
      ex('lat-pulldown-wide', 'Tras la piept, priză largă', 3, 10, 12, 90),
      ex('db-bench', 'Împins cu gantere pe bancă orizontală', 3, 8, 12, 90),
      ex('cable-row', 'Ramat la cablu, așezat, priză neutră', 3, 10, 12, 90, { note: 'Trunchi fix, nu balansa.' }),
      ex('leg-extension', 'Extensii de picioare', 2, 12, 15, 60),
      ex('biceps-triceps', 'Biceps cu gantere + extensii triceps la cablu (superset)', 2, 12, 12, 60),
      ex('side-plank', 'Side plank', 2, 15, 30, 60, { timed: true, perSide: true }),
    ],
  },
}

export const PROGRAM_IDS: Program[] = ['A', 'B', 'C']

export const WARMUP: string[] = [
  '3 minute bicicletă sau mers pe bandă, ritm ușor',
  'Cat-cow: 10 repetări lente',
  'Pod fesier pe podea: 2 × 12',
  'Bird dog: 2 × 8 pe fiecare parte, lent',
  'Dead bug: 2 × 8 pe fiecare parte',
  'Primul exercițiu al zilei: 2 seturi ușoare cu 40–50% din greutatea de lucru',
]

export const SAFETY_RULES: string[] = [
  'Expiră la efort. Fără ținut aerul.',
  'Oprește cu 2–3 repetări în rezervă (1–2 din săptămâna 5).',
  'Durere lombară ascuțită sau care iradiază: oprește exercițiul, nu doar setul.',
]

/** Programul zilei după ziua săptămânii, sau null în zilele fără sală. */
export function programForDate(dateKey: string): Program | null {
  const day = dateFromKey(dateKey).getDay()
  for (const p of PROGRAM_IDS) if (PROGRAMS[p].weekday === day) return p
  return null
}

/** Următoarea zi cu sală strict după dateKey. */
export function nextGymDay(dateKey: string): { date: string; program: Program } {
  for (let i = 1; i <= 7; i++) {
    const d = addDays(dateKey, i)
    const p = programForDate(d)
    if (p) return { date: d, program: p }
  }
  throw new Error('Nu există zi de sală în următoarele 7 zile')
}

export type SleepRule = 'normal' | 'reduced' | 'walk'

export function sleepRule(sleepHours: number | undefined): SleepRule {
  if (sleepHours === undefined) return 'normal'
  if (sleepHours < 4) return 'walk'
  if (sleepHours < 5) return 'reduced'
  return 'normal'
}

export function sleepRuleLabel(rule: SleepRule): string {
  switch (rule) {
    case 'normal':
      return 'Antrenament complet'
    case 'reduced':
      return 'Sub 5 ore de somn: un set mai puțin la fiecare exercițiu, fără cardio'
    case 'walk':
      return 'Sub 4 ore de somn: doar încălzirea și 20 de minute de mers pe bandă'
  }
}

export function isDeloadWeek(week: number): boolean {
  return week === 7 || week === 13
}

/** Seturile de făcut la un exercițiu, după săptămână și regula somnului. */
export function plannedSets(exercise: Exercise, week: number, rule: SleepRule): number {
  if (rule === 'walk') return 0
  if (exercise.fromWeek !== undefined && week < exercise.fromWeek && week >= 1) return 0
  let sets = exercise.sets
  if (week <= 2 || isDeloadWeek(week)) sets = Math.min(sets, 2)
  if (rule === 'reduced') sets = Math.max(1, sets - 1)
  return sets
}

export function cardioMinutesForWeek(week: number, rule: SleepRule = 'normal'): number {
  if (rule !== 'normal') return rule === 'walk' ? 20 : 0
  if (isDeloadWeek(week)) return 15
  if (week <= 2) return 10
  if (week <= 4) return 15
  if (week <= 8) return 20
  return 25
}

export function phaseNote(week: number): string {
  if (week < 1) return 'Înainte de start: învață mișcările, greutăți ușoare.'
  if (week <= 2) return 'Adaptare: 2 seturi, 3 repetări în rezervă, greutăți conservatoare.'
  if (isDeloadWeek(week)) return 'Descărcare: 2 seturi, greutăți cu 20% mai mici. Corpul recuperează.'
  if (week <= 6) return 'Construcție: 3 seturi, progresie dublă (repetări, apoi greutate).'
  if (week <= 12) return 'Consolidare: 1–2 repetări în rezervă, împinge progresia.'
  return 'După ziua 90: menține sau începe un bloc nou.'
}

export interface SetRecord {
  weightKg: number
  reps: number
}

export interface Suggestion {
  weightKg: number | null
  reason: string
}

/** Progresie dublă: la limita de sus a repetărilor pe toate seturile, crește greutatea. */
export function suggestNextWeight(exercise: Exercise, lastSets: SetRecord[]): Suggestion {
  if (lastSets.length === 0) return { weightKg: null, reason: 'Prima dată: alege o greutate cu 2–3 repetări în rezervă.' }
  const weights = lastSets.map((s) => s.weightKg)
  const maxWeight = Math.max(...weights)
  const allTop = lastSets.every((s) => s.reps >= exercise.repsMax)
  if (!allTop) {
    return { weightKg: maxWeight, reason: `Aceeași greutate. Țintește +1 repetare pe set spre ${exercise.repsMax}.` }
  }
  const increment = exercise.id === 'leg-press' ? Math.max(2.5, Math.round((maxWeight * 0.05) * 2) / 2) : 2.5
  const next = Math.round((maxWeight + increment) * 2) / 2
  return { weightKg: next, reason: `Ai atins ${exercise.repsMax} pe toate seturile. Crește la ${next.toFixed(1).replace('.', ',')} kg și revino la ${exercise.repsMin}.` }
}

export const SET_LIMITS = {
  weightKg: { min: 0, max: 500 },
  reps: { min: 1, max: 100 },
  seconds: { min: 1, max: 300 },
  sleepHours: { min: 0, max: 14 },
} as const

export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.round(total))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

/** Etichetă „Luni · Ziua A · Săptămâna 4”. */
export function sessionEyebrow(dateKey: string, program: Program, startDate: string = PLAN.startDate): string {
  const week = weekNumber(dateKey, startDate)
  const weekday = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'][dateFromKey(dateKey).getDay()]
  const w = week >= 1 && week <= 13 ? ` · Săptămâna ${week}` : ''
  return `${weekday} · ${PROGRAMS[program].label}${w}`
}

export { keyFromDate }
