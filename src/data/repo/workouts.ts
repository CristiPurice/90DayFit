import { db, type SetEntry, type WorkoutEntry } from '../db'
import { SET_LIMITS, type Program } from '@/domain/workouts'

export function getWorkout(date: string): Promise<WorkoutEntry | undefined> {
  return db.workouts.get(date)
}

/** Creează sau actualizează sesiunea zilei (program și somn). Nu resetează seturile. */
export async function startWorkout(date: string, program: Program, sleepHours?: number): Promise<WorkoutEntry> {
  if (sleepHours !== undefined && (sleepHours < SET_LIMITS.sleepHours.min || sleepHours > SET_LIMITS.sleepHours.max)) {
    throw new RangeError('Orele de somn trebuie să fie între 0 și 14')
  }
  return db.transaction('rw', db.workouts, async () => {
    const current = await db.workouts.get(date)
    const entry: WorkoutEntry = {
      date,
      program,
      completed: current?.completed ?? false,
      cardioMinutes: current?.cardioMinutes ?? 0,
    }
    if (sleepHours !== undefined) entry.sleepHours = sleepHours
    else if (current?.sleepHours !== undefined) entry.sleepHours = current.sleepHours
    if (current?.note) entry.note = current.note
    await db.workouts.put(entry)
    return entry
  })
}

export async function setCardio(date: string, minutes: number): Promise<void> {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 180) throw new RangeError('Cardio trebuie să fie între 0 și 180 de minute')
  await db.transaction('rw', db.workouts, async () => {
    const current = await db.workouts.get(date)
    if (!current) throw new Error('Nu există antrenament început pentru această zi')
    await db.workouts.put({ ...current, cardioMinutes: minutes })
  })
}

export async function completeWorkout(date: string, completed = true): Promise<void> {
  await db.transaction('rw', db.workouts, async () => {
    const current = await db.workouts.get(date)
    if (!current) throw new Error('Nu există antrenament început pentru această zi')
    await db.workouts.put({ ...current, completed })
  })
}

export function listWorkoutsBetween(from: string, to: string): Promise<WorkoutEntry[]> {
  return db.workouts.where('date').between(from, to, true, true).sortBy('date')
}

export async function addSet(date: string, exercise: string, weightKg: number, reps: number): Promise<number> {
  const { weightKg: w, reps: r } = SET_LIMITS
  if (!Number.isFinite(weightKg) || weightKg < w.min || weightKg > w.max) throw new RangeError(`Greutatea trebuie să fie între ${w.min} și ${w.max} kg`)
  if (!Number.isInteger(reps) || reps < r.min || reps > r.max) throw new RangeError(`Repetările trebuie să fie între ${r.min} și ${r.max}`)
  return db.transaction('rw', db.sets, async () => {
    const existing = await db.sets.where('date').equals(date).filter((s) => s.exercise === exercise).count()
    const entry: SetEntry = { date, exercise, setNo: existing + 1, weightKg: Math.round(weightKg * 2) / 2, reps }
    return (await db.sets.add(entry)) as number
  })
}

export async function deleteSet(id: number): Promise<void> {
  await db.transaction('rw', db.sets, async () => {
    const target = await db.sets.get(id)
    if (!target) return
    await db.sets.delete(id)
    // Renumerotează seturile rămase ale aceluiași exercițiu din aceeași zi.
    const rest = await db.sets.where('date').equals(target.date).filter((s) => s.exercise === target.exercise).sortBy('setNo')
    await Promise.all(rest.map((s, i) => db.sets.update(s.id!, { setNo: i + 1 })))
  })
}

export async function listSetsForDay(date: string): Promise<SetEntry[]> {
  const rows = await db.sets.where('date').equals(date).toArray()
  return rows.sort((a, b) => a.exercise.localeCompare(b.exercise) || a.setNo - b.setNo)
}

/** Seturile din cea mai recentă sesiune anterioară a exercițiului. */
export async function lastSessionSets(exercise: string, beforeDate: string): Promise<SetEntry[]> {
  const rows = await db.sets.where('date').below(beforeDate).filter((s) => s.exercise === exercise).toArray()
  if (rows.length === 0) return []
  const lastDate = rows.reduce((m, s) => (s.date > m ? s.date : m), rows[0]!.date)
  return rows.filter((s) => s.date === lastDate).sort((a, b) => a.setNo - b.setNo)
}
