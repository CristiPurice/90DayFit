import Dexie, { type EntityTable } from 'dexie'

export type DateKey = string // 'aaaa-ll-zz'

export interface WeightEntry {
  date: DateKey
  kg: number
  note?: string
}

export interface WaterEntry {
  date: DateKey
  totalMl: number
  events: { time: string; ml: number }[]
}

export interface StepsEntry {
  date: DateKey
  count: number
  source: 'manual'
}

export type BpSlot = 'am' | 'pm'
export interface BpEntry {
  date: DateKey
  slot: BpSlot
  systolic: number
  diastolic: number
  pulse?: number
  time: string
  note?: string
}

export type Program = 'A' | 'B' | 'C'
export interface WorkoutEntry {
  date: DateKey
  program: Program
  sleepHours?: number
  completed: boolean
  cardioMinutes: number
  note?: string
}

export interface SetEntry {
  id?: number
  date: DateKey
  exercise: string
  setNo: number
  weightKg: number
  reps: number
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner'
export interface MealEntry {
  date: DateKey
  slot: MealSlot
  optionId: string
  followed: boolean
}

export interface ReviewEntry {
  weekNo: number
  date: DateKey
  answers: string[]
  decision: string
}

export interface SettingRow {
  key: string
  value: unknown
}

export class AppDB extends Dexie {
  weights!: EntityTable<WeightEntry, 'date'>
  water!: EntityTable<WaterEntry, 'date'>
  steps!: EntityTable<StepsEntry, 'date'>
  bp!: EntityTable<BpEntry, 'date'>
  workouts!: EntityTable<WorkoutEntry, 'date'>
  sets!: EntityTable<SetEntry, 'id'>
  meals!: EntityTable<MealEntry, 'date'>
  reviews!: EntityTable<ReviewEntry, 'weekNo'>
  settings!: EntityTable<SettingRow, 'key'>

  constructor(name = 'ninetyDayFit') {
    super(name)
    this.version(1).stores({
      weights: 'date',
      water: 'date',
      steps: 'date',
      bp: '[date+slot],date',
      workouts: 'date',
      sets: '++id,date',
      meals: '[date+slot],date',
      reviews: 'weekNo',
      settings: 'key',
    })
  }
}

export const db = new AppDB()
