import { db } from '../db'
import { latestWaist, listWaist, putWaist } from './waist'
import { getReview, listReviews, putReview } from './reviews'
import { exportBackup, importBackup } from '../backup'

beforeEach(async () => {
  await Promise.all([db.waist.clear(), db.reviews.clear()])
})

describe('talie', () => {
  it('salvează rotunjit la 0,5 și returnează ultima', async () => {
    await putWaist('2026-09-13', 115.3)
    await putWaist('2026-09-20', 113.8)
    expect((await listWaist()).map((w) => w.cm)).toEqual([115.5, 114])
    expect((await latestWaist())?.date).toBe('2026-09-20')
    await expect(putWaist('2026-09-27', 30)).rejects.toThrow(RangeError)
  })
})

describe('evaluări', () => {
  it('salvează pe săptămână și listează ordonat', async () => {
    await putReview({ weekNo: 4, date: '2026-10-04', answers: ['a'], decision: 'Nimic' })
    await putReview({ weekNo: 3, date: '2026-09-27', answers: ['b'], decision: 'Nimic' })
    await putReview({ weekNo: 4, date: '2026-10-04', answers: ['a2'], decision: '+150 kcal' })
    expect((await listReviews()).map((r) => r.weekNo)).toEqual([3, 4])
    expect((await getReview(4))?.decision).toBe('+150 kcal')
    await expect(putReview({ weekNo: 0, date: 'x', answers: [], decision: '' })).rejects.toThrow(RangeError)
  })
})

describe('backup cu talie', () => {
  it('include tabelul waist și acceptă backup-uri vechi fără el', async () => {
    await putWaist('2026-09-13', 115)
    const b = await exportBackup()
    expect(b.schema).toBe(2)
    expect(b.tables.waist).toEqual([{ date: '2026-09-13', cm: 115 }])
    await importBackup({ app: '90dayfit', schema: 1, exportedAt: 'x', tables: { weights: [{ date: '2026-09-07', kg: 130 }] } })
    expect(await listWaist()).toEqual([])
    expect((await db.weights.toArray()).length).toBe(1)
  })
})
