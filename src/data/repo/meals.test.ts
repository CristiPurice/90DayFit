import { db } from '../db'
import { getMealsForDay, listMealsBetween, setMealChoice, setMealFollowed } from './meals'

beforeEach(async () => {
  await db.meals.clear()
})

describe('mese', () => {
  it('bifarea creează intrarea cu varianta de bază', async () => {
    await setMealFollowed('2026-09-07', 'breakfast', true)
    const rows = await getMealsForDay('2026-09-07')
    expect(rows).toEqual([{ date: '2026-09-07', slot: 'breakfast', optionId: 'base', followed: true }])
  })

  it('alegerea alternativei păstrează bifa', async () => {
    await setMealFollowed('2026-09-07', 'lunch', true)
    await setMealChoice('2026-09-07', 'lunch', 'alt2')
    const [row] = await getMealsForDay('2026-09-07')
    expect(row).toEqual({ date: '2026-09-07', slot: 'lunch', optionId: 'alt2', followed: true })
  })

  it('bifarea păstrează alternativa aleasă', async () => {
    await setMealChoice('2026-09-07', 'dinner', 'alt1')
    await setMealFollowed('2026-09-07', 'dinner', true)
    await setMealFollowed('2026-09-07', 'dinner', false)
    const [row] = await getMealsForDay('2026-09-07')
    expect(row?.optionId).toBe('alt1')
    expect(row?.followed).toBe(false)
  })

  it('respinge opțiuni necunoscute și listează pe interval', async () => {
    await expect(setMealChoice('2026-09-07', 'lunch', 'x' as never)).rejects.toThrow(RangeError)
    await setMealChoice('2026-09-07', 'lunch', 'alt1')
    await setMealChoice('2026-09-09', 'lunch', 'alt1')
    await setMealChoice('2026-10-09', 'lunch', 'alt1')
    expect((await listMealsBetween('2026-09-01', '2026-09-30')).length).toBe(2)
  })
})
