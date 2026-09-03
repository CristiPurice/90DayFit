import { db } from '../db'

export interface Settings {
  startDate: string
  startKg: number
  targetKg: number
  waistStartCm: number
  calorieTarget: number
  theme: string
  pinHash: string
  pinSalt: string
  lockTimeoutMin: number
  onboarded: boolean
}

export type SettingKey = keyof Settings

export async function getSetting<K extends SettingKey>(key: K): Promise<Settings[K] | undefined> {
  const row = await db.settings.get(key)
  return row?.value as Settings[K] | undefined
}

export async function setSetting<K extends SettingKey>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value })
}

export async function setSettings(values: Partial<Settings>): Promise<void> {
  const rows = Object.entries(values).map(([key, value]) => ({ key, value }))
  await db.settings.bulkPut(rows)
}

export async function getAllSettings(): Promise<Partial<Settings>> {
  const rows = await db.settings.toArray()
  const out: Record<string, unknown> = {}
  for (const row of rows) out[row.key] = row.value
  return out as Partial<Settings>
}
