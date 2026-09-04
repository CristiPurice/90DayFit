/** Planul alimentar de 2.400 kcal, cu 3 mese și câte 2 alternative. Sursa: plan-transformare-90-zile.md */

export type MealSlot = 'breakfast' | 'lunch' | 'dinner'
export type MealOptionId = 'base' | 'alt1' | 'alt2'

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']

export interface Macros {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface MealOption {
  id: MealOptionId
  title: string
  items: string[]
  macros: Macros
  note?: string
}

export interface MealSlotPlan {
  label: string
  time: string
  options: MealOption[]
}

export const MEAL_PLAN: Record<MealSlot, MealSlotPlan> = {
  breakfast: {
    label: 'Mic dejun',
    time: '06:30–07:30',
    options: [
      {
        id: 'base',
        title: 'Ovăz, iaurt, ouă, banană',
        items: ['Fulgi de ovăz 70 g', 'Iaurt grecesc 2% 200 g', 'Banană 1', 'Ouă fierte 3', 'Nuci sau migdale 20 g'],
        macros: { kcal: 820, protein: 50, carbs: 81, fat: 35 },
        note: 'Ovăzul se pune seara în iaurt cu banana. Ouăle se fierb 6–8 odată.',
      },
      {
        id: 'alt1',
        title: 'Omletă cu pui și pâine integrală',
        items: ['Ouă 4', 'Piept de pui gătit 100 g', 'Pâine integrală 2 felii (80 g)', 'Roșie 1', 'Ulei 1 linguriță'],
        macros: { kcal: 700, protein: 62, carbs: 42, fat: 30 },
      },
      {
        id: 'alt2',
        title: 'Brânză de vaci cu ovăz și fructe',
        items: ['Brânză de vaci 5% 300 g', 'Fulgi de ovăz 60 g', 'Fructe de pădure 150 g sau măr 1', 'Nuci 15 g', 'Ou fiert 1'],
        macros: { kcal: 700, protein: 60, carbs: 65, fat: 22 },
      },
    ],
  },
  lunch: {
    label: 'Prânz',
    time: '12:30–13:30',
    options: [
      {
        id: 'base',
        title: 'Pui la grătar, orez, salată',
        items: ['Piept de pui la grătar 200 g', 'Orez sau cartofi gătiți 200 g', 'Salată cu ulei 1 lingură 200 g', 'Măr 1'],
        macros: { kcal: 790, protein: 68, carbs: 81, fat: 20 },
        note: 'La catering: „grătar, garnitură simplă, salată, fără sos și fără pâine”.',
      },
      {
        id: 'alt1',
        title: 'Pui rotisat cu salată de varză',
        items: ['Pui rotisat fără piele ½ (≈250 g carne)', 'Chiflă integrală 1', 'Salată de varză fără maioneză'],
        macros: { kcal: 750, protein: 70, carbs: 45, fat: 30 },
        note: 'Puiul rotisat e sărat: nu adăuga sare în restul zilei.',
      },
      {
        id: 'alt2',
        title: 'Salată cu pui, iaurt și pâine',
        items: ['Salată cu piept de pui ambalată 250 g', 'Iaurt grecesc 200 g', 'Pâine integrală 2 felii', 'Banană 1'],
        macros: { kcal: 700, protein: 55, carbs: 80, fat: 18 },
      },
    ],
  },
  dinner: {
    label: 'Cină',
    time: '19:30–20:30',
    options: [
      {
        id: 'base',
        title: 'Pui, cartofi la cuptor, legume',
        items: ['Piept de pui 220 g', 'Cartofi la cuptor 350 g', 'Legume (broccoli, ardei, dovlecel) 300 g', 'Ulei de măsline 1 lingură'],
        macros: { kcal: 810, protein: 78, carbs: 80, fat: 21 },
        note: 'Masa de după antrenament. Cina în maximum 2 ore după sală.',
      },
      {
        id: 'alt1',
        title: 'Vită tocată cu paste integrale',
        items: ['Carne tocată de vită 5–10% 200 g', 'Paste integrale 100 g (crude)', 'Sos de roșii fără zahăr', 'Salată'],
        macros: { kcal: 850, protein: 62, carbs: 80, fat: 26 },
      },
      {
        id: 'alt2',
        title: 'Curcan cu orez și legume',
        items: ['Piept de curcan 220 g', 'Orez 80 g (crud)', 'Legume 250 g', 'Ulei 1 lingură'],
        macros: { kcal: 800, protein: 70, carbs: 75, fat: 18 },
      },
    ],
  },
}

export const MEAL_OPTION_IDS: MealOptionId[] = ['base', 'alt1', 'alt2']

export function mealOption(slot: MealSlot, id: MealOptionId): MealOption {
  const opt = MEAL_PLAN[slot].options.find((o) => o.id === id)
  if (!opt) throw new Error(`Opțiune inexistentă: ${slot}/${id}`)
  return opt
}

export type MealChoices = Partial<Record<MealSlot, MealOptionId>>

/** Totalul zilei pentru opțiunile alese; sloturile lipsă folosesc varianta de bază. */
export function dayTotals(choices: MealChoices): Macros {
  const total: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  for (const slot of MEAL_SLOTS) {
    const m = mealOption(slot, choices[slot] ?? 'base').macros
    total.kcal += m.kcal
    total.protein += m.protein
    total.carbs += m.carbs
    total.fat += m.fat
  }
  return total
}

export interface Adherence {
  done: number
  total: number
}

export function adherence(followed: Partial<Record<MealSlot, boolean>>): Adherence {
  const done = MEAL_SLOTS.filter((s) => followed[s] === true).length
  return { done, total: MEAL_SLOTS.length }
}
