import { db, type WaterEntry } from '../db'
import { WATER_MAX_ML_PER_DAY } from '@/domain/water'

function nowTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function getWater(date: string): Promise<WaterEntry | undefined> {
  return db.water.get(date)
}

/** Adaugă o porție. Plafonează la limita zilnică de siguranță. Returnează intrarea actualizată. */
export async function addWaterEvent(date: string, ml: number, time: string = nowTime()): Promise<WaterEntry> {
  if (!Number.isInteger(ml) || ml <= 0) throw new RangeError('Cantitatea trebuie să fie un număr pozitiv de ml')
  return db.transaction('rw', db.water, async () => {
    const current = (await db.water.get(date)) ?? { date, totalMl: 0, events: [] }
    const allowed = Math.min(ml, WATER_MAX_ML_PER_DAY - current.totalMl)
    if (allowed <= 0) return current
    const next: WaterEntry = {
      date,
      totalMl: current.totalMl + allowed,
      events: [...current.events, { time, ml: allowed }],
    }
    await db.water.put(next)
    return next
  })
}

/** Scoate ultima porție adăugată. Returnează intrarea actualizată sau undefined dacă nu era nimic. */
export async function undoLastWater(date: string): Promise<WaterEntry | undefined> {
  return db.transaction('rw', db.water, async () => {
    const current = await db.water.get(date)
    if (!current || current.events.length === 0) return current
    const events = current.events.slice(0, -1)
    const next: WaterEntry = { date, totalMl: events.reduce((s, e) => s + e.ml, 0), events }
    await db.water.put(next)
    return next
  })
}

export function listWaterBetween(from: string, to: string): Promise<WaterEntry[]> {
  return db.water.where('date').between(from, to, true, true).sortBy('date')
}
