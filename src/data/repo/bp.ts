import { db, type BpEntry, type BpSlot } from '../db'
import { isValidBp } from '@/domain/bp'

export interface BpInput {
  date: string
  slot: BpSlot
  systolic: number
  diastolic: number
  pulse?: number
  time?: string
  note?: string
}

function nowTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export async function putBp(input: BpInput): Promise<void> {
  if (!isValidBp(input.systolic, input.diastolic, input.pulse)) {
    throw new RangeError('Valorile tensiunii sunt în afara intervalului acceptat')
  }
  const entry: BpEntry = {
    date: input.date,
    slot: input.slot,
    systolic: Math.round(input.systolic),
    diastolic: Math.round(input.diastolic),
    time: input.time ?? nowTime(),
  }
  if (input.pulse !== undefined) entry.pulse = Math.round(input.pulse)
  if (input.note) entry.note = input.note
  await db.bp.put(entry)
}

export function getBp(date: string, slot: BpSlot): Promise<BpEntry | undefined> {
  return db.bp.get([date, slot] as unknown as string)
}

export function deleteBp(date: string, slot: BpSlot): Promise<void> {
  return db.bp.delete([date, slot] as unknown as string)
}

export function listBpBetween(from: string, to: string): Promise<BpEntry[]> {
  return db.bp.where('date').between(from, to, true, true).sortBy('date')
}

export function listBpForDay(date: string): Promise<BpEntry[]> {
  return db.bp.where('date').equals(date).toArray()
}
