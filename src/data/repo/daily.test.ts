import { db } from '../db'
import { putWeight, getWeight, listWeightsBetween, deleteWeight } from './weights'
import { addWaterEvent, undoLastWater, getWater } from './water'
import { putSteps, getSteps, listStepsBetween } from './steps'
import { putBp, getBp, listBpBetween, listBpForDay, deleteBp } from './bp'

beforeEach(async () => {
  await Promise.all([db.weights.clear(), db.water.clear(), db.steps.clear(), db.bp.clear()])
})

describe('greutăți', () => {
  it('salvează rotunjit la o zecimală și suprascrie aceeași zi', async () => {
    await putWeight('2026-09-07', 129.96)
    await putWeight('2026-09-07', 129.4)
    expect((await getWeight('2026-09-07'))?.kg).toBe(129.4)
  })
  it('respinge valori în afara intervalului', async () => {
    await expect(putWeight('2026-09-07', 30)).rejects.toThrow(RangeError)
    await expect(putWeight('2026-09-07', 301)).rejects.toThrow(RangeError)
  })
  it('listează în interval, ordonat', async () => {
    await putWeight('2026-09-09', 129)
    await putWeight('2026-09-07', 130)
    await putWeight('2026-09-20', 127)
    const rows = await listWeightsBetween('2026-09-07', '2026-09-13')
    expect(rows.map((r) => r.date)).toEqual(['2026-09-07', '2026-09-09'])
    await deleteWeight('2026-09-09')
    expect(await getWeight('2026-09-09')).toBeUndefined()
  })
})

describe('apă', () => {
  it('adună porțiile și le anulează pe rând', async () => {
    await addWaterEvent('2026-09-07', 250, '08:00')
    const after = await addWaterEvent('2026-09-07', 500, '10:00')
    expect(after.totalMl).toBe(750)
    expect(after.events).toHaveLength(2)
    const undone = await undoLastWater('2026-09-07')
    expect(undone?.totalMl).toBe(250)
    await undoLastWater('2026-09-07')
    expect((await getWater('2026-09-07'))?.totalMl).toBe(0)
    expect(await undoLastWater('2026-09-07')).toBeDefined()
  })
  it('plafonează la 8 litri pe zi', async () => {
    await addWaterEvent('2026-09-07', 7900, '08:00')
    const r = await addWaterEvent('2026-09-07', 500, '09:00')
    expect(r.totalMl).toBe(8000)
    const same = await addWaterEvent('2026-09-07', 250, '10:00')
    expect(same.totalMl).toBe(8000)
    expect(same.events).toHaveLength(2)
  })
  it('respinge cantități invalide', async () => {
    await expect(addWaterEvent('2026-09-07', 0)).rejects.toThrow(RangeError)
    await expect(addWaterEvent('2026-09-07', 12.5)).rejects.toThrow(RangeError)
  })
})

describe('pași', () => {
  it('salvează și listează', async () => {
    await putSteps('2026-09-07', 6240)
    await putSteps('2026-09-08', 7000)
    expect((await getSteps('2026-09-07'))?.count).toBe(6240)
    expect((await listStepsBetween('2026-09-01', '2026-09-30')).length).toBe(2)
  })
  it('respinge valori invalide', async () => {
    await expect(putSteps('2026-09-07', -1)).rejects.toThrow(RangeError)
    await expect(putSteps('2026-09-07', 12.5)).rejects.toThrow(RangeError)
    await expect(putSteps('2026-09-07', 60001)).rejects.toThrow(RangeError)
  })
})

describe('tensiune', () => {
  it('salvează AM și PM separat pentru aceeași zi', async () => {
    await putBp({ date: '2026-09-07', slot: 'am', systolic: 126, diastolic: 78, pulse: 64, time: '07:00' })
    await putBp({ date: '2026-09-07', slot: 'pm', systolic: 124, diastolic: 80, time: '22:00' })
    expect((await getBp('2026-09-07', 'am'))?.pulse).toBe(64)
    expect((await getBp('2026-09-07', 'pm'))?.systolic).toBe(124)
    expect(await listBpForDay('2026-09-07')).toHaveLength(2)
  })
  it('suprascrie aceeași zi și slot', async () => {
    await putBp({ date: '2026-09-07', slot: 'am', systolic: 126, diastolic: 78 })
    await putBp({ date: '2026-09-07', slot: 'am', systolic: 130, diastolic: 82 })
    expect((await getBp('2026-09-07', 'am'))?.systolic).toBe(130)
    expect(await listBpForDay('2026-09-07')).toHaveLength(1)
  })
  it('listează în interval și șterge', async () => {
    await putBp({ date: '2026-09-07', slot: 'am', systolic: 126, diastolic: 78 })
    await putBp({ date: '2026-09-09', slot: 'am', systolic: 126, diastolic: 78 })
    await putBp({ date: '2026-10-09', slot: 'am', systolic: 126, diastolic: 78 })
    expect((await listBpBetween('2026-09-01', '2026-09-30')).length).toBe(2)
    await deleteBp('2026-09-07', 'am')
    expect(await getBp('2026-09-07', 'am')).toBeUndefined()
  })
  it('respinge valori invalide', async () => {
    await expect(putBp({ date: '2026-09-07', slot: 'am', systolic: 70, diastolic: 80 })).rejects.toThrow(RangeError)
    await expect(putBp({ date: '2026-09-07', slot: 'am', systolic: 126, diastolic: 78, pulse: 10 })).rejects.toThrow(RangeError)
  })
})
