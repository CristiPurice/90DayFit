import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card, CardLabel } from '@/ui/Card'
import { NumberField } from '@/ui/NumberField'
import { Button } from '@/ui/Button'
import { formatKg } from '@/domain/format'
import { SET_LIMITS, suggestNextWeight, type Exercise } from '@/domain/workouts'
import type { SetEntry } from '@/data/db'
import { addSet, deleteSet, lastSessionSets } from '@/data/repo/workouts'

export interface ExerciseCardProps {
  dateKey: string
  exercise: Exercise
  plannedSets: number
  sets: SetEntry[]
  locked: boolean
  onLogged: (restSec: number) => void
}

function describeSets(sets: SetEntry[], timed: boolean): string {
  if (sets.length === 0) return ''
  const w = sets[0]!.weightKg
  const sameWeight = sets.every((s) => s.weightKg === w)
  const reps = sets.map((s) => s.reps).join(', ')
  if (timed) return `${reps} s`
  return sameWeight ? `${formatKg(w)} kg × ${reps}` : sets.map((s) => `${formatKg(s.weightKg)}×${s.reps}`).join(', ')
}

export function ExerciseCard({ dateKey, exercise, plannedSets, sets, locked, onLogged }: ExerciseCardProps) {
  const last = useLiveQuery(() => lastSessionSets(exercise.id, dateKey), [exercise.id, dateKey])
  const [kg, setKg] = useState<number | null>(null)
  const [reps, setReps] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const timed = exercise.timed === true

  const suggestion = suggestNextWeight(exercise, last ?? [])
  const nextNo = sets.length + 1
  const done = sets.length >= plannedSets && plannedSets > 0
  const unit = timed ? 'Secunde' : 'Repetări'
  const target = `${plannedSets} × ${exercise.repsMin}${exercise.repsMax !== exercise.repsMin ? `–${exercise.repsMax}` : ''}${timed ? ' s' : ''}${exercise.perSide ? ' / parte' : ''} · pauză ${exercise.restSec} s`

  async function log() {
    const w = timed ? 0 : kg
    if (w === null || reps === null) return
    setSaving(true)
    try {
      await addSet(dateKey, exercise.id, w, Math.round(reps))
      onLogged(exercise.restSec)
    } finally {
      setSaving(false)
    }
  }

  if (plannedSets === 0) {
    return (
      <Card label={exercise.name} className="opacity-70">
        <CardLabel>Nu azi</CardLabel>
        <h2 className="mt-1 text-lg font-black leading-tight tracking-tight">{exercise.name}</h2>
        <p className="mt-1 text-sm text-card-muted">
          {exercise.fromWeek ? `Intră din săptămâna ${exercise.fromWeek}.` : 'Sărit după regula somnului.'}
        </p>
      </Card>
    )
  }

  return (
    <Card label={exercise.name} className={done ? 'ring-4 ring-good/60' : ''}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardLabel>{target}</CardLabel>
          <h2 className="mt-1 text-lg font-black leading-tight tracking-tight">{exercise.name}</h2>
        </div>
        <span className={`num flex h-10 min-w-10 flex-none items-center justify-center rounded-xl px-2 text-base font-black ${done ? 'bg-good text-white' : 'bg-line text-card-fg'}`}>
          {sets.length}/{plannedSets}
        </span>
      </div>
      {exercise.note && <p className="mt-1 text-xs text-card-muted">{exercise.note}</p>}

      <p className="num mt-2 text-sm text-card-muted">
        Ultima dată: {last === undefined ? '…' : last.length === 0 ? 'nimic notat' : describeSets(last, timed)}
      </p>
      {!timed && (
        <p className="mt-1 text-sm">
          <span className="font-bold">{suggestion.weightKg === null ? 'Start' : `Sugestie ${formatKg(suggestion.weightKg)} kg`}</span>
          <span className="text-card-muted"> · {suggestion.reason}</span>
        </p>
      )}

      {sets.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1" aria-label={`Seturi ${exercise.name}`}>
          {sets.map((s) => (
            <li key={s.id} className="num flex items-center justify-between rounded-xl bg-line/60 px-3 py-2 text-sm font-bold">
              <span>
                Set {s.setNo}: {timed ? `${s.reps} s` : `${formatKg(s.weightKg)} kg × ${s.reps}`}
              </span>
              {!locked && (
                <button type="button" onClick={() => deleteSet(s.id!)} aria-label={`Șterge setul ${s.setNo}`} className="px-2 text-card-muted">
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!locked && (
        <div className="mt-3 flex flex-col gap-2">
          <div className={`grid gap-2 ${timed ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {!timed && (
              <NumberField label="Kg" value={kg} onChange={setKg} min={SET_LIMITS.weightKg.min} max={SET_LIMITS.weightKg.max} digits={1} />
            )}
            <NumberField
              label={unit}
              value={reps}
              onChange={setReps}
              min={timed ? SET_LIMITS.seconds.min : SET_LIMITS.reps.min}
              max={timed ? SET_LIMITS.seconds.max : SET_LIMITS.reps.max}
              digits={0}
            />
          </div>
          <Button variant="primary" full onClick={log} disabled={saving || reps === null || (!timed && kg === null)} className="bg-bg text-fg">
            Notează setul {nextNo}
          </Button>
        </div>
      )}
    </Card>
  )
}
