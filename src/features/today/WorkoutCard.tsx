import { Link } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card, CardLabel } from '@/ui/Card'
import { formatDate } from '@/domain/format'
import { PROGRAMS, nextGymDay, programForDate, type Program } from '@/domain/workouts'
import { getWorkout, listSetsForDay } from '@/data/repo/workouts'

export interface WorkoutCardProps {
  dateKey: string
}

export function WorkoutCard({ dateKey }: WorkoutCardProps) {
  const workout = useLiveQuery(() => getWorkout(dateKey), [dateKey])
  const sets = useLiveQuery(() => listSetsForDay(dateKey), [dateKey])
  const scheduled = programForDate(dateKey)
  const program = (workout?.program as Program | undefined) ?? scheduled

  let title: string
  let detail: string
  if (!program) {
    const next = nextGymDay(dateKey)
    title = 'Zi de pași'
    detail = `Următorul: ${PROGRAMS[next.program].weekdayLabel}, ${PROGRAMS[next.program].label}, ${formatDate(next.date)}`
  } else {
    const plan = PROGRAMS[program]
    title = `${plan.label} · ${plan.exercises.slice(0, 3).map((e) => e.name.split(' (')[0]).join(', ')}`
    if (!workout) detail = 'Neînceput'
    else if (workout.completed) detail = `Încheiat ✓ · ${sets?.length ?? 0} seturi · cardio ${workout.cardioMinutes} min`
    else detail = `În curs · ${sets?.length ?? 0} seturi notate`
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardLabel>Antrenament</CardLabel>
        <Link to="/sala" className="text-xs font-bold uppercase tracking-wide text-bg">
          Deschide sala
        </Link>
      </div>
      <p className="mt-1 text-base font-black leading-tight">{title}</p>
      <p className={`num mt-1 text-sm ${workout?.completed ? 'font-bold text-good' : 'text-card-muted'}`}>{detail}</p>
    </Card>
  )
}
