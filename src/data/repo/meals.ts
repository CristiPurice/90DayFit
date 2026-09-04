import { db, type MealEntry } from '../db'
import type { MealOptionId, MealSlot } from '@/domain/meals'
import { MEAL_OPTION_IDS } from '@/domain/meals'

function key(date: string, slot: MealSlot): string {
  return [date, slot] as unknown as string
}

export async function setMealChoice(date: string, slot: MealSlot, optionId: MealOptionId): Promise<void> {
  if (!MEAL_OPTION_IDS.includes(optionId)) throw new RangeError(`Opțiune necunoscută: ${optionId}`)
  await db.transaction('rw', db.meals, async () => {
    const current = await db.meals.get(key(date, slot))
    const entry: MealEntry = { date, slot, optionId, followed: current?.followed ?? false }
    await db.meals.put(entry)
  })
}

export async function setMealFollowed(date: string, slot: MealSlot, followed: boolean): Promise<void> {
  await db.transaction('rw', db.meals, async () => {
    const current = await db.meals.get(key(date, slot))
    const entry: MealEntry = { date, slot, optionId: (current?.optionId as MealOptionId) ?? 'base', followed }
    await db.meals.put(entry)
  })
}

export function getMealsForDay(date: string): Promise<MealEntry[]> {
  return db.meals.where('date').equals(date).toArray()
}

export function listMealsBetween(from: string, to: string): Promise<MealEntry[]> {
  return db.meals.where('date').between(from, to, true, true).sortBy('date')
}
