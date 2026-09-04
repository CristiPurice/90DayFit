# Faza 2: Mese și rețete — plan de implementare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tab-ul Mese arată planul alimentar al zilei (3 mese, fiecare cu varianta de bază și 2 alternative), permite alegerea alternativei și bifarea „conform planului”, recalculează caloriile și proteinele zilei; tab-ul Rețete listează 28 de rețete din alimentele planului, filtrabile după masă și timp; ecranul Azi primește un card cu mesele zilei.

**Architecture:** Planul alimentar și rețetele sunt date statice în `src/domain/` (fără pește, din `plan-transformare-90-zile.md`). Alegerile și bifele stau în tabelul `meals` (Dexie), o intrare per zi și slot. Calculele de totaluri și aderență sunt pure.

## Global Constraints

- Sloturi: `breakfast` (Mic dejun), `lunch` (Prânz), `dinner` (Cină). Opțiuni per slot: `base`, `alt1`, `alt2`. Implicit, fără intrare în DB, ziua folosește `base` și `followed=false`.
- Ținte zilnice: 2.400 kcal, 170–200 g proteine (din `PLAN`).
- Rețetele nu conțin pește. Fiecare are: id, titlu, sloturi, minute, porții, ingrediente (nume, cantitate), pași, macro (kcal, P, C, G), etichete.
- Texte în română, cifre cu virgulă.

---

### Task 1: Domeniu — planul alimentar și rețetele
**Files:** `src/domain/meals.ts`, `src/domain/recipes.ts` + teste.
```ts
export type MealSlot = 'breakfast'|'lunch'|'dinner'
export type MealOptionId = 'base'|'alt1'|'alt2'
export interface Macros { kcal:number; protein:number; carbs:number; fat:number }
export interface MealOption { id:MealOptionId; title:string; items:string[]; macros:Macros; note?:string }
export const MEAL_PLAN: Record<MealSlot,{label:string; time:string; options:MealOption[]}>
export function mealOption(slot, id): MealOption
export function dayTotals(choices: Partial<Record<MealSlot, MealOptionId>>): Macros
export function adherence(followed: Partial<Record<MealSlot, boolean>>): {done:number; total:3}
export interface Recipe {...}; export const RECIPES: Recipe[]; export function filterRecipes(list, {slot?, maxMinutes?}): Recipe[]
```
- [ ] Teste: `dayTotals({})` = 820+790+810 kcal; `dayTotals({lunch:'alt2'})` schimbă doar prânzul; `adherence` numără; `RECIPES.length ≥ 25`, fără „pește/somon/ton” în ingrediente; `filterRecipes` după slot și timp. Commit.

### Task 2: Repo mese
**Files:** `src/data/repo/meals.ts` + teste.
`setMealChoice(date, slot, optionId)`, `setMealFollowed(date, slot, followed)`, `getMealsForDay(date)`, `listMealsBetween(from,to)`. `setMealFollowed` păstrează opțiunea existentă (sau `base`).
- [ ] Teste + commit.

### Task 3: UI — MealsPage, MealsCard pe Azi, RecipesPage
- `MealsPage`: antet cu totalul zilei (kcal / 2.400, proteine / 170–200) și aderență „2 din 3”; 3 `MealCard`-uri: etichetă + oră, titlul opțiunii alese, lista de alimente, macro, buton „Alternative” (sheet cu 3 opțiuni, cea aleasă marcată) și comutator „Conform planului”.
- `MealsCard` pe Azi: 3 rânduri cu bifă și titlu scurt, total kcal, link către /mese.
- `RecipesPage`: chip-uri de filtrare (Toate / Mic dejun / Prânz / Cină; ≤15 min / ≤30 min), listă de carduri (titlu, minute, kcal, P), sheet de detaliu (ingrediente, pași, macro).
- [ ] Teste componente + commit.

### Task 4: E2E + publicare
- `e2e/meals.spec.ts`: alege alternativa la prânz, bifează micul dejun, verifică totalul recalculat și aderența; deschide Rețete, filtrează „Cină”, deschide o rețetă. Reîncărcare → persistă.
- [ ] `npm run check && npm run build && npm run test:e2e` verde, îmbinare în `main`, push, verificare live.
