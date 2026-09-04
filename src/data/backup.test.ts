import { exportBackup, importBackup, validateBackup, clearAllData, BackupError, backupFileName } from './backup'
import { putWeight, getWeight } from './repo/weights'
import { putBp } from './repo/bp'
import { setSetting, getSetting } from './repo/settings'

beforeEach(async () => {
  await clearAllData()
})

describe('backup', () => {
  it('exportă toate tabelele cu antet', async () => {
    await putWeight('2026-09-07', 130)
    await putBp({ date: '2026-09-07', slot: 'am', systolic: 126, diastolic: 78, time: '07:00' })
    await setSetting('theme', 'coach')
    const b = await exportBackup()
    expect(b.app).toBe('90dayfit')
    expect(b.schema).toBe(2)
    expect(b.tables.weights).toHaveLength(1)
    expect(b.tables.bp).toHaveLength(1)
    expect(b.tables.settings).toEqual([{ key: 'theme', value: 'coach' }])
    expect(b.tables.workouts).toEqual([])
  })

  it('importă atomic, înlocuind datele existente', async () => {
    await putWeight('2026-09-01', 131)
    const b = await exportBackup()
    b.tables.weights = [{ date: '2026-09-07', kg: 130 }]
    b.tables.settings = [{ key: 'targetKg', value: 115 }]
    await importBackup(JSON.parse(JSON.stringify(b)))
    expect(await getWeight('2026-09-01')).toBeUndefined()
    expect((await getWeight('2026-09-07'))?.kg).toBe(130)
    expect(await getSetting('targetKg')).toBe(115)
  })

  it('nu schimbă nimic dacă un rând e invalid', async () => {
    await putWeight('2026-09-01', 131)
    const b = await exportBackup()
    // două rânduri cu aceeași cheie → bulkAdd eșuează → tranzacția se anulează
    b.tables.weights = [
      { date: '2026-09-07', kg: 130 },
      { date: '2026-09-07', kg: 129 },
    ]
    await expect(importBackup(b)).rejects.toBeTruthy()
    expect((await getWeight('2026-09-01'))?.kg).toBe(131)
  })

  it('respinge fișiere străine sau mai noi', () => {
    expect(() => validateBackup(null)).toThrow(BackupError)
    expect(() => validateBackup({ app: 'altceva' })).toThrow(/nu este un backup/)
    expect(() => validateBackup({ app: '90dayfit', schema: 99, tables: {} })).toThrow(/versiune mai nouă/)
    expect(() => validateBackup({ app: '90dayfit', schema: 1, tables: { weights: 'x' } })).toThrow(/nu este o listă/)
    expect(validateBackup({ app: '90dayfit', schema: 1, tables: {} }).schema).toBe(1)
  })

  it('numește fișierul după dată', () => {
    expect(backupFileName('2026-09-04')).toBe('90dayfit-backup-2026-09-04.json')
  })
})
