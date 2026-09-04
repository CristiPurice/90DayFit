import { MEAL_PLAN, MEAL_SLOTS, adherence, dayTotals, mealOption } from './meals'
import { RECIPES, filterRecipes, recipeById } from './recipes'

describe('planul alimentar', () => {
  it('are 3 mese cu câte 3 opțiuni', () => {
    for (const slot of MEAL_SLOTS) {
      expect(MEAL_PLAN[slot].options.map((o) => o.id)).toEqual(['base', 'alt1', 'alt2'])
    }
  })

  it('totalul zilei folosește varianta de bază implicit', () => {
    expect(dayTotals({})).toEqual({ kcal: 2420, protein: 196, carbs: 242, fat: 76 })
  })

  it('alternativa schimbă doar slotul ei', () => {
    const t = dayTotals({ lunch: 'alt2' })
    expect(t.kcal).toBe(820 + 700 + 810)
    expect(t.protein).toBe(50 + 55 + 78)
  })

  it('mealOption aruncă la id inexistent', () => {
    expect(() => mealOption('lunch', 'alt9' as never)).toThrow()
  })

  it('aderența numără mesele bifate', () => {
    expect(adherence({})).toEqual({ done: 0, total: 3 })
    expect(adherence({ breakfast: true, dinner: true, lunch: false })).toEqual({ done: 2, total: 3 })
  })
})

describe('rețete', () => {
  it('sunt cel puțin 25, cu id-uri unice', () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(25)
    expect(new Set(RECIPES.map((r) => r.id)).size).toBe(RECIPES.length)
  })

  it('nu conțin pește', () => {
    const forbidden = /pește|somon|ton\b|macrou|crap|păstrăv|sardin|hering/i
    for (const rec of RECIPES) {
      const text = [rec.title, ...rec.ingredients.map((i) => i.name), ...rec.steps].join(' ')
      expect(text).not.toMatch(forbidden)
    }
  })

  it('au macro plauzibile și cel puțin un pas', () => {
    for (const rec of RECIPES) {
      expect(rec.macros.kcal).toBeGreaterThan(300)
      expect(rec.macros.kcal).toBeLessThan(1000)
      expect(rec.macros.protein).toBeGreaterThan(10)
      expect(rec.steps.length).toBeGreaterThan(0)
      expect(rec.slots.length).toBeGreaterThan(0)
    }
  })

  it('filtrează după masă și timp', () => {
    const dinner = filterRecipes(RECIPES, { slot: 'dinner' })
    expect(dinner.length).toBeGreaterThanOrEqual(8)
    expect(dinner.every((r) => r.slots.includes('dinner'))).toBe(true)
    const quick = filterRecipes(RECIPES, { maxMinutes: 15 })
    expect(quick.every((r) => r.minutes <= 15)).toBe(true)
    expect(quick.length).toBeGreaterThanOrEqual(8)
    expect(filterRecipes(RECIPES, { slot: 'breakfast', maxMinutes: 5 }).map((r) => r.id)).toContain('overnight-oats')
  })

  it('găsește după id', () => {
    expect(recipeById('pui-cuptor-cartofi-legume')?.slots).toContain('dinner')
    expect(recipeById('nu-exista')).toBeUndefined()
  })
})
