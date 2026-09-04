import { useLiveQuery } from 'dexie-react-hooks'
import { Page } from '@/ui/Page'
import { Card, CardLabel } from '@/ui/Card'
import { BigNumber } from '@/ui/BigNumber'
import { formatDate, formatInt, formatKg, todayKey as today } from '@/domain/format'
import { PLAN, addDays, dayNumber, weekNumber } from '@/domain/plan'
import { sevenDayAverage, weightProgress } from '@/domain/weight'
import { bpSeries, weekMetrics, weeksUntil, weightSeries, type WeekInput } from '@/domain/progress'
import { db } from '@/data/db'
import { getAllSettings } from '@/data/repo/settings'
import { listReviews } from '@/data/repo/reviews'
import { listWaist } from '@/data/repo/waist'
import { BpChart, CHART, Legend, WeeklyBars, WeightChart } from './charts'
import { WaistCard } from './WaistCard'
import { ReviewCard } from './ReviewCard'

export interface ProgressPageProps {
  dateKey?: string
}

function useProgressData(from: string) {
  return useLiveQuery(async () => {
    const [weights, meals, workouts, sets, steps, bp, waist, reviews] = await Promise.all([
      db.weights.where('date').aboveOrEqual(from).toArray(),
      db.meals.where('date').aboveOrEqual(from).toArray(),
      db.workouts.where('date').aboveOrEqual(from).toArray(),
      db.sets.where('date').aboveOrEqual(from).toArray(),
      db.steps.where('date').aboveOrEqual(from).toArray(),
      db.bp.where('date').aboveOrEqual(from).toArray(),
      listWaist(),
      listReviews(),
    ])
    const input: WeekInput = { weights, meals, workouts, sets, steps, bp, waist }
    return { input, reviews, bpRows: bp }
  }, [from])
}

export function ProgressPage({ dateKey = today() }: ProgressPageProps) {
  const settings = useLiveQuery(getAllSettings, [])
  const startDate = settings?.startDate ?? PLAN.startDate
  const data = useProgressData(addDays(startDate, -14))

  if (!settings || !data) return <Page title="Progres" eyebrow={formatDate(dateKey)} />

  const startKg = settings.startKg ?? PLAN.startKg
  const targetKg = settings.targetKg ?? PLAN.targetKg
  const waistStart = settings.waistStartCm ?? PLAN.waistStartCm
  const { input, reviews, bpRows } = data
  const day = dayNumber(dateKey, startDate)
  const week = weekNumber(dateKey, startDate)
  const eyebrow = day >= 1 && day <= 91 ? `Ziua ${day} din 90 · săptămâna ${week}` : day < 1 ? `Start pe ${formatDate(startDate)}` : 'După ziua 90'

  const avg = sevenDayAverage(input.weights, dateKey)
  const progress = avg === null ? null : weightProgress(startKg, targetKg, avg)
  const wPoints = weightSeries(input.weights.filter((w) => w.date >= startDate), startDate)
  const bpPoints = bpSeries(bpRows.filter((b) => b.date >= startDate)).slice(-40)

  const weeks = weeksUntil(dateKey, startDate)
  const metricsByWeek = weeks.map((w) => weekMetrics(w.weekNo, input, startDate))
  const reviewWeek = Math.max(1, Math.min(PLAN.totalWeeks, week))
  const reviewMetrics = weekMetrics(reviewWeek, input, startDate)
  const prevMetrics = reviewWeek > 1 ? weekMetrics(reviewWeek - 1, input, startDate) : undefined
  const existing = reviews.find((r) => r.weekNo === reviewWeek)

  return (
    <Page title="Progres" eyebrow={eyebrow}>
      <Card label="Greutate">
        <div className="flex items-end justify-between gap-3">
          <div>
            <CardLabel>Media 7 zile</CardLabel>
            {avg === null ? <p className="mt-1 text-xl font-black uppercase text-bg">Fără cântăriri</p> : <BigNumber value={formatKg(avg)} suffix="kg" />}
          </div>
          {progress && (
            <div className="text-right">
              <CardLabel>Pierdut</CardLabel>
              <BigNumber value={`−${formatKg(progress.lostKg)}`} suffix="kg" size="md" />
              <p className="num text-xs text-card-muted">{progress.percent}% din drum</p>
            </div>
          )}
        </div>
        <div className="mt-3">
          <WeightChart points={wPoints} targetKg={targetKg} startKg={startKg} />
        </div>
        <Legend items={[{ color: CHART.s1, label: 'Media 7 zile' }, { color: CHART.muted, label: 'Țintă', dashed: true }]} />
      </Card>

      <WaistCard entries={input.waist} startCm={waistStart} todayKey={dateKey} />

      <Card label="Tensiune">
        <CardLabel>Tensiune · ultimele {bpPoints.length} citiri</CardLabel>
        <p className="num mt-1 text-sm text-card-muted">
          Zile peste 140/90 în ultimele 30: <span className="font-bold text-card-fg">{reviewMetrics.highBpDays30}</span>
        </p>
        <div className="mt-3">
          <BpChart points={bpPoints} />
        </div>
        <Legend items={[{ color: CHART.s1, label: 'Sistolică' }, { color: CHART.s2, label: 'Diastolică' }, { color: CHART.danger, label: '140 / 90', dashed: true }]} />
      </Card>

      <Card label="Pași pe săptămâni">
        <CardLabel>Pași · media zilnică pe săptămână</CardLabel>
        <div className="mt-3">
          <WeeklyBars bars={metricsByWeek.map((m) => ({ weekNo: m.weekNo, value: m.avgSteps, target: m.stepTarget }))} unit="pași" />
        </div>
        <Legend items={[{ color: CHART.s1, label: 'Media' }, { color: CHART.s2, label: 'Țintă' }]} />
      </Card>

      <Card label="Aderență">
        <CardLabel>Mese conform planului · din 21 pe săptămână</CardLabel>
        <div className="mt-3">
          <WeeklyBars bars={metricsByWeek.map((m) => ({ weekNo: m.weekNo, value: m.mealsFollowed, target: 18 }))} unit="mese" max={21} />
        </div>
        <Legend items={[{ color: CHART.s1, label: 'Mese conforme' }, { color: CHART.s2, label: 'Țintă 18' }]} />
      </Card>

      <Card label="Antrenamente">
        <CardLabel>Antrenamente încheiate și volum</CardLabel>
        <ul className="mt-2 flex flex-col divide-y divide-line text-sm">
          {metricsByWeek.length === 0 && <li className="py-2 text-card-muted">Începe din prima săptămână a planului.</li>}
          {metricsByWeek.map((m) => (
            <li key={m.weekNo} className="num flex items-center justify-between py-2">
              <span className="font-bold">S{m.weekNo}</span>
              <span>{m.workoutsDone} / 3</span>
              <span className="text-card-muted">{formatInt(m.volumeKg)} kg</span>
              <span className={`text-xs font-bold ${m.strengthTrend === 'up' ? 'text-good' : m.strengthTrend === 'down' ? 'text-danger' : 'text-card-muted'}`}>
                {m.strengthTrend === 'up' ? '▲ forță' : m.strengthTrend === 'down' ? '▼ forță' : m.strengthTrend === 'flat' ? '= forță' : '—'}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <ReviewCard metrics={reviewMetrics} prevMetrics={prevMetrics} existing={existing} todayKey={dateKey} />

      {reviews.length > 0 && (
        <Card label="Evaluări anterioare">
          <CardLabel>Evaluări salvate</CardLabel>
          <ul className="mt-2 flex flex-col divide-y divide-line text-sm">
            {[...reviews].reverse().map((r) => (
              <li key={r.weekNo} className="flex items-center justify-between py-2">
                <span className="font-bold">Săptămâna {r.weekNo}</span>
                <span className="text-card-muted">{r.decision}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Page>
  )
}
