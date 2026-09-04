import { db } from '../db'
import {
  addSet,
  completeWorkout,
  deleteSet,
  getWorkout,
  lastSessionSets,
  listSetsForDay,
  listWorkoutsBetween,
  setCardio,
  startWorkout,
} from './workouts'

beforeEach(async () => {
  await Promise.all([db.workouts.clear(), db.sets.clear()])
})

describe('antrenamente', () => {
  it('începe sesiunea și păstrează somnul la reapelare', async () => {
    await startWorkout('2026-09-07', 'A', 6)
    await startWorkout('2026-09-07', 'A')
    const w = await getWorkout('2026-09-07')
    expect(w).toEqual({ date: '2026-09-07', program: 'A', completed: false, cardioMinutes: 0, sleepHours: 6 })
  })

  it('respinge somn invalid și cardio invalid', async () => {
    await expect(startWorkout('2026-09-07', 'A', 15)).rejects.toThrow(RangeError)
    await startWorkout('2026-09-07', 'A')
    await expect(setCardio('2026-09-07', -1)).rejects.toThrow(RangeError)
    await expect(setCardio('2026-09-08', 10)).rejects.toThrow(/Nu există/)
  })

  it('notează cardio și încheie', async () => {
    await startWorkout('2026-09-07', 'A', 6)
    await setCardio('2026-09-07', 15)
    await completeWorkout('2026-09-07')
    const w = await getWorkout('2026-09-07')
    expect(w?.cardioMinutes).toBe(15)
    expect(w?.completed).toBe(true)
    await startWorkout('2026-09-09', 'B')
    expect((await listWorkoutsBetween('2026-09-01', '2026-09-30')).map((x) => x.program)).toEqual(['A', 'B'])
  })
})

describe('seturi', () => {
  it('numerotează seturile per exercițiu și zi', async () => {
    await addSet('2026-09-07', 'leg-press', 140, 12)
    await addSet('2026-09-07', 'leg-press', 140, 11)
    await addSet('2026-09-07', 'chest-press', 40, 10)
    const rows = await listSetsForDay('2026-09-07')
    expect(rows.map((s) => [s.exercise, s.setNo, s.weightKg, s.reps])).toEqual([
      ['chest-press', 1, 40, 10],
      ['leg-press', 1, 140, 12],
      ['leg-press', 2, 140, 11],
    ])
  })

  it('rotunjește la 0,5 kg și validează', async () => {
    await addSet('2026-09-07', 'chest-press', 22.3, 10)
    expect((await listSetsForDay('2026-09-07'))[0]?.weightKg).toBe(22.5)
    await expect(addSet('2026-09-07', 'x', 501, 10)).rejects.toThrow(RangeError)
    await expect(addSet('2026-09-07', 'x', 10, 0)).rejects.toThrow(RangeError)
    await expect(addSet('2026-09-07', 'x', 10, 2.5)).rejects.toThrow(RangeError)
  })

  it('ștergerea renumerotează', async () => {
    const id1 = await addSet('2026-09-07', 'leg-press', 140, 12)
    await addSet('2026-09-07', 'leg-press', 140, 11)
    await addSet('2026-09-07', 'leg-press', 140, 10)
    await deleteSet(id1)
    const rows = await listSetsForDay('2026-09-07')
    expect(rows.map((s) => [s.setNo, s.reps])).toEqual([
      [1, 11],
      [2, 10],
    ])
  })

  it('găsește sesiunea anterioară a exercițiului', async () => {
    await addSet('2026-09-07', 'leg-press', 130, 12)
    await addSet('2026-09-11', 'leg-press', 135, 12)
    await addSet('2026-09-11', 'leg-press', 135, 11)
    await addSet('2026-09-14', 'leg-press', 140, 10)
    const last = await lastSessionSets('leg-press', '2026-09-14')
    expect(last.map((s) => [s.weightKg, s.reps])).toEqual([
      [135, 12],
      [135, 11],
    ])
    expect(await lastSessionSets('leg-press', '2026-09-07')).toEqual([])
    expect(await lastSessionSets('hip-thrust', '2026-09-30')).toEqual([])
  })
})
