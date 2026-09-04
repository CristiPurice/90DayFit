import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'
import { Page } from '@/ui/Page'
import { formatDate, todayKey } from '@/domain/format'
import { PLAN, dayNumber, weekNumber } from '@/domain/plan'
import { getAllSettings } from '@/data/repo/settings'
import { WeightCard } from './WeightCard'
import { WaterCard } from './WaterCard'
import { StepsCard } from './StepsCard'
import { BpCard } from './BpCard'
import { MealsCard } from './MealsCard'

export interface TodayPageProps {
  /** Pentru teste; implicit ziua curentă. */
  dateKey?: string
}

export function TodayPage({ dateKey = todayKey() }: TodayPageProps) {
  const settings = useLiveQuery(getAllSettings, [])
  const startDate = settings?.startDate ?? PLAN.startDate
  const startKg = settings?.startKg ?? PLAN.startKg
  const targetKg = settings?.targetKg ?? PLAN.targetKg
  const day = dayNumber(dateKey, startDate)
  const week = weekNumber(dateKey, startDate)
  const eyebrow =
    day >= 1 && day <= 91
      ? `Ziua ${day} din 90 · Săptămâna ${week} · ${formatDate(dateKey)}`
      : day < 1
        ? `Start pe ${formatDate(startDate)} · azi ${formatDate(dateKey)}`
        : `După ziua 90 · ${formatDate(dateKey)}`

  const action = (
    <Link to="/setari" className="rounded-full px-3 py-2 text-sm font-bold uppercase tracking-wide text-muted">
      Setări
    </Link>
  )

  if (!settings) return <Page title="Azi" eyebrow={formatDate(dateKey)} action={action} />

  return (
    <Page title="Azi" eyebrow={eyebrow} action={action}>
      <WeightCard dateKey={dateKey} startKg={startKg} targetKg={targetKg} />
      <div className="grid grid-cols-1 gap-3">
        <WaterCard dateKey={dateKey} targetMl={PLAN.waterTargetMl} />
        <StepsCard dateKey={dateKey} startDate={startDate} />
      </div>
      <BpCard dateKey={dateKey} />
      <MealsCard dateKey={dateKey} />
    </Page>
  )
}
