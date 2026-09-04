import { Link } from 'react-router'
import { Card, CardLabel } from '@/ui/Card'
import { MEAL_PLAN, MEAL_SLOTS, mealOption } from '@/domain/meals'
import { formatInt } from '@/domain/format'
import { useDayMeals } from '@/features/meals/MealsPage'

export interface MealsCardProps {
  dateKey: string
}

export function MealsCard({ dateKey }: MealsCardProps) {
  const { choices, followed, totals, adherence } = useDayMeals(dateKey)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardLabel>Mesele de azi · {formatInt(totals.kcal)} kcal</CardLabel>
        <Link to="/mese" className="text-xs font-bold uppercase tracking-wide text-bg">
          Vezi mesele
        </Link>
      </div>
      <ul className="mt-2 flex flex-col">
        {MEAL_SLOTS.map((slot) => {
          const done = followed[slot] === true
          const opt = mealOption(slot, choices[slot] ?? 'base')
          return (
            <li key={slot} className="flex items-center gap-3 border-b border-line py-2 last:border-b-0">
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-sm font-black ${done ? 'bg-good text-white' : 'border-2 border-line text-transparent'}`}
              >
                ✓
              </span>
              <span className="flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-widest text-card-muted">{MEAL_PLAN[slot].label}</span>
                <span className="block text-sm font-bold">{opt.title}</span>
              </span>
              <span className="num text-sm text-card-muted">{formatInt(opt.macros.kcal)}</span>
            </li>
          )
        })}
      </ul>
      <p className="num mt-2 text-xs font-bold text-card-muted">
        {adherence.done} din {adherence.total} conform planului
      </p>
    </Card>
  )
}
