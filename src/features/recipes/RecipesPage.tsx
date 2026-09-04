import { useState } from 'react'
import { Page } from '@/ui/Page'
import { Card, CardLabel } from '@/ui/Card'
import { Sheet } from '@/ui/Sheet'
import { formatInt } from '@/domain/format'
import { MEAL_PLAN, type MealSlot } from '@/domain/meals'
import { RECIPES, filterRecipes, type Recipe } from '@/domain/recipes'

type SlotFilter = MealSlot | 'all'
type TimeFilter = 15 | 30 | 'any'

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${active ? 'bg-accent text-accent-fg' : 'bg-key text-key-fg'}`}
    >
      {children}
    </button>
  )
}

export function RecipesPage() {
  const [slot, setSlot] = useState<SlotFilter>('all')
  const [time, setTime] = useState<TimeFilter>('any')
  const [selected, setSelected] = useState<Recipe | null>(null)

  const filter = {
    ...(slot !== 'all' ? { slot } : {}),
    ...(time !== 'any' ? { maxMinutes: time } : {}),
  }
  const list = filterRecipes(RECIPES, filter)

  return (
    <Page title="Rețete" eyebrow={`${list.length} din ${RECIPES.length} · din alimentele planului, fără pește`}>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtru după masă">
        <Chip active={slot === 'all'} onClick={() => setSlot('all')}>Toate</Chip>
        {(Object.keys(MEAL_PLAN) as MealSlot[]).map((s) => (
          <Chip key={s} active={slot === s} onClick={() => setSlot(s)}>
            {MEAL_PLAN[s].label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtru după timp">
        <Chip active={time === 'any'} onClick={() => setTime('any')}>Orice durată</Chip>
        <Chip active={time === 15} onClick={() => setTime(15)}>≤ 15 min</Chip>
        <Chip active={time === 30} onClick={() => setTime(30)}>≤ 30 min</Chip>
      </div>

      <ul className="flex flex-col gap-3" aria-label="Rețete">
        {list.map((rec) => (
          <li key={rec.id}>
            <Card onPress={() => setSelected(rec)} label={rec.title}>
              <h2 className="text-lg font-black leading-tight tracking-tight">{rec.title}</h2>
              <p className="num mt-1 text-sm text-card-muted">
                {rec.minutes} min · {formatInt(rec.macros.kcal)} kcal · {rec.macros.protein} g proteine
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-card-muted">
                {rec.slots.map((s) => MEAL_PLAN[s].label).join(' · ')}
                {rec.tags.length > 0 && ` · ${rec.tags.join(' · ')}`}
              </p>
            </Card>
          </li>
        ))}
      </ul>

      <Sheet open={selected !== null} onClose={() => setSelected(null)} title={selected?.title ?? ''}>
        {selected && (
          <>
            <p className="num -mt-2 text-sm text-muted">
              {selected.minutes} min · {formatInt(selected.macros.kcal)} kcal · {selected.macros.protein} P · {selected.macros.carbs} C ·{' '}
              {selected.macros.fat} G
            </p>
            <Card>
              <CardLabel>Ingrediente</CardLabel>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {selected.ingredients.map((i) => (
                  <li key={i.name} className="flex justify-between gap-3">
                    <span>{i.name}</span>
                    <span className="num text-card-muted">{i.qty}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardLabel>Preparare</CardLabel>
              <ol className="mt-2 flex list-decimal flex-col gap-2 pl-5 text-sm">
                {selected.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </Card>
          </>
        )}
      </Sheet>
    </Page>
  )
}
