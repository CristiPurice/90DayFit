import { useLiveQuery } from 'dexie-react-hooks'
import { Page } from '@/ui/Page'
import { Card, CardLabel } from '@/ui/Card'
import { BigNumber } from '@/ui/BigNumber'
import { ProgressBar } from '@/ui/ProgressBar'
import { formatDate, formatInt, todayKey } from '@/domain/format'
import { PLAN } from '@/domain/plan'
import { MEAL_SLOTS, adherence, dayTotals, type MealOptionId, type MealSlot } from '@/domain/meals'
import { getMealsForDay } from '@/data/repo/meals'
import { MealCard } from './MealCard'

export interface MealsPageProps {
  dateKey?: string
}

export function useDayMeals(dateKey: string) {
  const rows = useLiveQuery(() => getMealsForDay(dateKey), [dateKey])
  const choices: Partial<Record<MealSlot, MealOptionId>> = {}
  const followed: Partial<Record<MealSlot, boolean>> = {}
  for (const row of rows ?? []) {
    choices[row.slot] = row.optionId as MealOptionId
    followed[row.slot] = row.followed
  }
  return { loaded: rows !== undefined, choices, followed, totals: dayTotals(choices), adherence: adherence(followed) }
}

export function MealsPage({ dateKey = todayKey() }: MealsPageProps) {
  const { loaded, choices, followed, totals, adherence: adh } = useDayMeals(dateKey)
  const proteinOk = totals.protein >= PLAN.proteinMinG && totals.protein <= PLAN.proteinMaxG
  const kcalOk = totals.kcal >= PLAN.calorieMin && totals.kcal <= PLAN.calorieTarget + 150

  if (!loaded) return <Page title="Mese" eyebrow={formatDate(dateKey)} />

  return (
    <Page title="Mese" eyebrow={`${formatDate(dateKey)} · țintă ${formatInt(PLAN.calorieTarget)} kcal`}>
      <Card>
        <div className="flex items-end justify-between gap-3">
          <div>
            <CardLabel>Totalul zilei</CardLabel>
            <BigNumber value={formatInt(totals.kcal)} suffix="kcal" />
          </div>
          <div className="text-right">
            <CardLabel>Proteine</CardLabel>
            <BigNumber value={String(totals.protein)} suffix="g" size="md" />
          </div>
        </div>
        <p className="mt-2 text-sm text-card-muted">
          <span className={kcalOk ? '' : 'font-bold text-warn'}>
            {kcalOk ? 'Calorii în plan' : 'Calorii în afara planului'}
          </span>
          {' · '}
          <span className={proteinOk ? '' : 'font-bold text-warn'}>
            proteine {proteinOk ? 'în' : 'în afara'} intervalului {PLAN.proteinMinG}–{PLAN.proteinMaxG} g
          </span>
        </p>
        <div className="mt-3 flex flex-col gap-1">
          <ProgressBar percent={(adh.done / adh.total) * 100} tone={adh.done === adh.total ? 'good' : 'bg'} label="Mese conform planului" />
          <p className="num text-sm font-bold" data-testid="adherence">
            {adh.done} din {adh.total} mese conform planului
          </p>
        </div>
      </Card>

      {MEAL_SLOTS.map((slot) => (
        <MealCard key={slot} dateKey={dateKey} slot={slot} optionId={choices[slot] ?? 'base'} followed={followed[slot] ?? false} />
      ))}
    </Page>
  )
}
