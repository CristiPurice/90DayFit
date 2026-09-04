import { db, type StepsEntry } from '../db'
import { STEPS_MAX_PER_DAY } from '@/domain/steps'

export async function putSteps(date: string, count: number): Promise<void> {
  if (!Number.isInteger(count) || count < 0 || count > STEPS_MAX_PER_DAY) {
    throw new RangeError(`Pașii trebuie să fie un număr întreg între 0 și ${STEPS_MAX_PER_DAY}`)
  }
  const entry: StepsEntry = { date, count, source: 'manual' }
  await db.steps.put(entry)
}

export function getSteps(date: string): Promise<StepsEntry | undefined> {
  return db.steps.get(date)
}

export function listStepsBetween(from: string, to: string): Promise<StepsEntry[]> {
  return db.steps.where('date').between(from, to, true, true).sortBy('date')
}
