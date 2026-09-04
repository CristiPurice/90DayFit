import { db, type WaistEntry } from '../db'

export const WAIST_LIMITS = { min: 50, max: 200 } as const

export async function putWaist(date: string, cm: number): Promise<void> {
  if (!Number.isFinite(cm) || cm < WAIST_LIMITS.min || cm > WAIST_LIMITS.max) {
    throw new RangeError(`Talia trebuie să fie între ${WAIST_LIMITS.min} și ${WAIST_LIMITS.max} cm`)
  }
  await db.waist.put({ date, cm: Math.round(cm * 2) / 2 })
}

export function listWaist(): Promise<WaistEntry[]> {
  return db.waist.orderBy('date').toArray()
}

export async function latestWaist(): Promise<WaistEntry | undefined> {
  return db.waist.orderBy('date').last()
}
