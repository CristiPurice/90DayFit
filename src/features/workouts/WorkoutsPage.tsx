import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Page } from '@/ui/Page'
import { Card, CardLabel } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { NumberField } from '@/ui/NumberField'
import { formatDate, formatInt, formatKg, todayKey } from '@/domain/format'
import { PLAN, weekNumber } from '@/domain/plan'
import {
  PROGRAMS,
  PROGRAM_IDS,
  SAFETY_RULES,
  SET_LIMITS,
  WARMUP,
  cardioMinutesForWeek,
  nextGymDay,
  phaseNote,
  plannedSets,
  programForDate,
  sessionEyebrow,
  sleepRule,
  sleepRuleLabel,
  type Program,
} from '@/domain/workouts'
import { getAllSettings } from '@/data/repo/settings'
import { completeWorkout, getWorkout, listSetsForDay, setCardio, startWorkout } from '@/data/repo/workouts'
import { ExerciseCard } from './ExerciseCard'
import { RestTimer } from './RestTimer'
import { useRestTimer } from './useRestTimer'

export interface WorkoutsPageProps {
  dateKey?: string
}

export function WorkoutsPage({ dateKey = todayKey() }: WorkoutsPageProps) {
  const settings = useLiveQuery(getAllSettings, [])
  const workout = useLiveQuery(async () => (await getWorkout(dateKey)) ?? null, [dateKey])
  const sets = useLiveQuery(() => listSetsForDay(dateKey), [dateKey])
  const timer = useRestTimer()
  const [chosen, setChosen] = useState<Program | null>(null)
  const [sleep, setSleep] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const startDate = settings?.startDate ?? PLAN.startDate
  const week = weekNumber(dateKey, startDate)
  const scheduled = programForDate(dateKey)
  const program: Program | null = (workout?.program as Program | undefined) ?? chosen ?? scheduled

  if (settings === undefined || workout === undefined || sets === undefined) {
    return <Page title="Sală" eyebrow={formatDate(dateKey)} />
  }

  // Zi fără sală și fără antrenament început
  if (!program) {
    const next = nextGymDay(dateKey)
    return (
      <Page title="Sală" eyebrow={`${formatDate(dateKey)} · zi de pași`}>
        <Card>
          <CardLabel>Azi</CardLabel>
          <h2 className="mt-1 text-xl font-black tracking-tight">Zi de pași și încălzire lombară</h2>
          <p className="mt-1 text-sm text-card-muted">
            5 minute dimineața: cat-cow, bird dog, dead bug. Următorul antrenament: {PROGRAMS[next.program].weekdayLabel},{' '}
            {PROGRAMS[next.program].label}, {formatDate(next.date)}.
          </p>
        </Card>
        <Card>
          <CardLabel>Antrenezi totuși azi?</CardLabel>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PROGRAM_IDS.map((p) => (
              <Button key={p} variant="primary" onClick={() => setChosen(p)} className="bg-bg text-fg">
                {PROGRAMS[p].label}
              </Button>
            ))}
          </div>
        </Card>
      </Page>
    )
  }

  const plan = PROGRAMS[program]
  const eyebrow = sessionEyebrow(dateKey, program, startDate)

  // Antrenament neînceput: întreabă somnul
  if (workout === null) {
    const previewRule = sleepRule(sleep ?? undefined)
    return (
      <Page title="Sală" eyebrow={eyebrow}>
        <Card>
          <CardLabel>Înainte de start</CardLabel>
          <h2 className="mt-1 text-xl font-black tracking-tight">Cât ai dormit azi-noapte?</h2>
          <p className="mt-1 text-sm text-card-muted">{phaseNote(week)}</p>
          <div className="mt-3">
            <NumberField label="Ore de somn" value={sleep} onChange={setSleep} suffix="h" min={SET_LIMITS.sleepHours.min} max={SET_LIMITS.sleepHours.max} digits={1} />
          </div>
          <p role="status" className="mt-2 text-sm font-bold">
            {sleepRuleLabel(previewRule)}
          </p>
          <div className="mt-3">
            <Button
              full
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  await startWorkout(dateKey, program, sleep ?? undefined)
                } finally {
                  setBusy(false)
                }
              }}
            >
              Începe antrenamentul
            </Button>
          </div>
        </Card>
        {scheduled !== program && (
          <p className="text-center text-xs text-muted">
            Ai ales {plan.label} într-o zi de {scheduled ? PROGRAMS[scheduled].label : 'pași'}.
          </p>
        )}
      </Page>
    )
  }

  const rule = sleepRule(workout.sleepHours)
  const cardioTarget = cardioMinutesForWeek(week, rule)
  const locked = workout.completed
  const totalSets = sets.length
  const volume = sets.reduce((v, s) => v + s.weightKg * s.reps, 0)

  return (
    <Page title="Sală" eyebrow={eyebrow}>
      <Card className={rule === 'normal' ? '' : 'ring-4 ring-warn/70'}>
        <CardLabel>
          Somn: {workout.sleepHours === undefined ? 'nenotat' : `${formatKg(workout.sleepHours)} h`}
        </CardLabel>
        <p role="status" className="mt-1 text-sm font-bold">
          {sleepRuleLabel(rule)}
        </p>
        <p className="mt-1 text-xs text-card-muted">{phaseNote(week)}</p>
      </Card>

      {locked && (
        <Card className="ring-4 ring-good/60">
          <CardLabel>Antrenament încheiat</CardLabel>
          <p className="num mt-1 text-lg font-black">
            {totalSets} seturi · volum {formatInt(volume)} kg · cardio {workout.cardioMinutes} min
          </p>
          <div className="mt-3">
            <Button variant="ghost" full onClick={() => completeWorkout(dateKey, false)} className="min-h-12 text-sm">
              Redeschide
            </Button>
          </div>
        </Card>
      )}

      <details className="rounded-3xl bg-card/15 px-4 py-3 text-fg">
        <summary className="cursor-pointer text-sm font-black uppercase tracking-wide">Încălzire (10 min) și reguli</summary>
        <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-sm">
          {WARMUP.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ol>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-muted">
          {SAFETY_RULES.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
      </details>

      {rule === 'walk' ? (
        <Card>
          <CardLabel>Azi</CardLabel>
          <p className="mt-1 text-base font-black">Încălzirea completă și 20 de minute de mers pe bandă. Atât.</p>
        </Card>
      ) : (
        plan.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            dateKey={dateKey}
            exercise={exercise}
            plannedSets={plannedSets(exercise, week, rule)}
            sets={sets.filter((s) => s.exercise === exercise.id)}
            locked={locked}
            onLogged={timer.start}
          />
        ))
      )}

      <Card label="Cardio" className={workout.cardioMinutes > 0 ? 'ring-4 ring-good/60' : ''}>
        <CardLabel>Cardio după forță</CardLabel>
        <p className="mt-1 text-base font-black">
          {cardioTarget === 0 ? 'Fără cardio azi (regula somnului)' : `${cardioTarget} minute, ritm de conversație`}
        </p>
        <p className="num mt-1 text-sm text-card-muted">Notat: {workout.cardioMinutes} min</p>
        {!locked && cardioTarget > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="primary" onClick={() => setCardio(dateKey, cardioTarget)} className="bg-bg text-fg">
              Făcut {cardioTarget} min
            </Button>
            <Button variant="ghost" onClick={() => setCardio(dateKey, 0)} className="text-card-fg">
              Fără cardio
            </Button>
          </div>
        )}
      </Card>

      {!locked && (
        <Button full disabled={busy} onClick={() => completeWorkout(dateKey)}>
          Încheie antrenamentul
        </Button>
      )}

      <RestTimer timer={timer} />
    </Page>
  )
}
