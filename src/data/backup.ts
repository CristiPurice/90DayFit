import { db } from './db'

export const BACKUP_SCHEMA = 2
const TABLES = ['weights', 'water', 'steps', 'bp', 'workouts', 'sets', 'meals', 'reviews', 'waist', 'settings'] as const
type TableName = (typeof TABLES)[number]

export interface Backup {
  app: '90dayfit'
  schema: number
  exportedAt: string
  tables: Partial<Record<TableName, unknown[]>>
}

export class BackupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupError'
  }
}

export async function exportBackup(): Promise<Backup> {
  const tables = {} as Record<TableName, unknown[]>
  await db.transaction('r', db.tables, async () => {
    for (const name of TABLES) tables[name] = await db.table(name).toArray()
  })
  return { app: '90dayfit', schema: BACKUP_SCHEMA, exportedAt: new Date().toISOString(), tables }
}

export function backupFileName(dateKey: string): string {
  return `90dayfit-backup-${dateKey}.json`
}

/** Verifică structura fără să atingă baza. Aruncă BackupError cu mesaj clar. */
export function validateBackup(json: unknown): Backup {
  if (typeof json !== 'object' || json === null) throw new BackupError('Fișierul nu conține un backup valid')
  const b = json as Partial<Backup>
  if (b.app !== '90dayfit') throw new BackupError('Fișierul nu este un backup 90 Day Fit')
  if (typeof b.schema !== 'number') throw new BackupError('Backup-ului îi lipsește versiunea de schemă')
  if (b.schema > BACKUP_SCHEMA) {
    throw new BackupError(`Backup-ul este dintr-o versiune mai nouă (schema ${b.schema}). Actualizează aplicația.`)
  }
  if (typeof b.tables !== 'object' || b.tables === null) throw new BackupError('Backup-ului îi lipsesc tabelele')
  const tables = b.tables as Record<string, unknown>
  for (const name of TABLES) {
    const rows = tables[name]
    if (rows !== undefined && !Array.isArray(rows)) throw new BackupError(`Tabelul „${name}” nu este o listă`)
  }
  return b as Backup
}

/** Înlocuiește toate datele cu cele din backup, atomic: dacă ceva eșuează, nu se schimbă nimic. */
export async function importBackup(json: unknown): Promise<void> {
  const backup = validateBackup(json)
  await db.transaction('rw', db.tables, async () => {
    for (const name of TABLES) {
      const table = db.table(name)
      await table.clear()
      const rows = backup.tables[name]
      if (rows && rows.length > 0) await table.bulkAdd(rows)
    }
  })
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const name of TABLES) await db.table(name).clear()
  })
}
