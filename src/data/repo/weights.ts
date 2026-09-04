import { db, type WeightEntry } from '../db'

export const WEIGHT_LIMITS = { min: 40, max: 300 } as const

export async function putWeight(date: string, kg: number, note?: string): Promise<void> {
  if (!Number.isFinite(kg) || kg < WEIGHT_LIMITS.min || kg > WEIGHT_LIMITS.max) {
    throw new RangeError(`Greutatea trebuie să fie între ${WEIGHT_LIMITS.min} și ${WEIGHT_LIMITS.max} kg`)
  }
  const entry: WeightEntry = { date, kg: Math.round(kg * 10) / 10 }
  if (note) entry.note = note
  await db.weights.put(entry)
}

export function getWeight(date: string): Promise<WeightEntry | undefined> {
  return db.weights.get(date)
}

export function deleteWeight(date: string): Promise<void> {
  return db.weights.delete(date)
}

/** Intrările din [from, to], ordonate după dată. */
export function listWeightsBetween(from: string, to: string): Promise<WeightEntry[]> {
  return db.weights.where('date').between(from, to, true, true).sortBy('date')
}
