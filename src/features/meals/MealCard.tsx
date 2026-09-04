import { useState } from 'react'
import { Card, CardLabel } from '@/ui/Card'
import { Sheet } from '@/ui/Sheet'
import { Button } from '@/ui/Button'
import { MEAL_PLAN, mealOption, type MealOptionId, type MealSlot } from '@/domain/meals'
import { formatInt } from '@/domain/format'
import { setMealChoice, setMealFollowed } from '@/data/repo/meals'

export interface MealCardProps {
  dateKey: string
  slot: MealSlot
  optionId: MealOptionId
  followed: boolean
}

export function MealCard({ dateKey, slot, optionId, followed }: MealCardProps) {
  const [open, setOpen] = useState(false)
  const plan = MEAL_PLAN[slot]
  const option = mealOption(slot, optionId)
  const m = option.macros

  return (
    <>
      <Card className={followed ? 'ring-4 ring-good/60' : ''}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardLabel>
              {plan.label} · {plan.time}
            </CardLabel>
            <h2 className="mt-1 text-xl font-black leading-tight tracking-tight">{option.title}</h2>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={followed}
            aria-label={`${plan.label}: conform planului`}
            onClick={() => setMealFollowed(dateKey, slot, !followed)}
            className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl text-2xl font-black ${followed ? 'bg-good text-white' : 'border-2 border-line text-card-muted'}`}
          >
            ✓
          </button>
        </div>

        <ul className="mt-3 flex flex-col gap-1 text-sm text-card-fg">
          {option.items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-card-muted">·</span>
              {item}
            </li>
          ))}
        </ul>

        <p className="num mt-3 text-sm font-bold">
          {formatInt(m.kcal)} kcal
          <span className="text-card-muted">
            {' '}
            · {m.protein} P · {m.carbs} C · {m.fat} G
          </span>
        </p>
        {option.note && <p className="mt-1 text-xs text-card-muted">{option.note}</p>}

        <div className="mt-3">
          <Button variant="ghost" full onClick={() => setOpen(true)} className="min-h-12 text-sm">
            Alternative
          </Button>
        </div>
      </Card>

      <Sheet open={open} onClose={() => setOpen(false)} title={`${plan.label} · alege varianta`}>
        <div role="radiogroup" aria-label={`Variante pentru ${plan.label.toLowerCase()}`} className="flex flex-col gap-2">
          {plan.options.map((o) => {
            const chosen = o.id === optionId
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={chosen}
                onClick={async () => {
                  await setMealChoice(dateKey, slot, o.id)
                  setOpen(false)
                }}
                className={`rounded-2xl p-4 text-left ${chosen ? 'bg-accent text-accent-fg' : 'bg-card text-card-fg'}`}
              >
                <span className="block text-base font-black leading-tight">{o.title}</span>
                <span className="num mt-1 block text-sm opacity-70">
                  {formatInt(o.macros.kcal)} kcal · {o.macros.protein} g proteine
                </span>
              </button>
            )
          })}
        </div>
      </Sheet>
    </>
  )
}
