# Faza 1: Zilnicul — plan de implementare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ecranul Azi devine util zilnic: notezi greutatea, apa, pașii și tensiunea de dimineață și de seară, vezi progresul față de țintă, iar datele pot fi exportate și importate ca JSON.

**Architecture:** Calculele stau în `src/domain/` (pure, testate), accesul la date în `src/data/repo/` (Dexie, un fișier per tabel), reactivitatea prin `useLiveQuery` din `dexie-react-hooks`. Fiecare card de pe Azi este o componentă cu propriul sheet de introducere. Setările (export, import, ștergere) sunt pe ruta `/setari`, deschisă din antetul paginii Azi.

**Tech Stack:** cele din faza 0 plus `dexie-react-hooks`.

## Global Constraints

- Validări: greutate 40–300 kg; sistolică 60–250; diastolică 30–150; puls 30–220; apă 0–8.000 ml/zi; pași 0–60.000.
- Clasificare tensiune: `normal` sub 130/80; `atentie` 130–139 sau 80–89; `ridicata` 140+ sau 90+; `consult` 180+ sau 120+.
- Media pe 7 zile = media valorilor existente din ultimele 7 zile calendaristice, inclusiv ziua curentă. Ritmul săptămânal = media 7 zile curentă minus media celor 7 zile anterioare.
- Export JSON: `{ app:'90dayfit', schema:1, exportedAt, tables:{weights,water,steps,bp,workouts,sets,meals,reviews,settings} }`. Import: validare de structură, apoi înlocuire atomică în tranzacție.
- Toate textele în română, cifre cu virgulă, dată `zz.ll.aaaa`.
- `npm run check` verde și commit la finalul fiecărui task.

---

### Task 1: Domeniu — greutate, apă, pași, tensiune
**Files:** `src/domain/weight.ts`, `water.ts`, `steps.ts`, `bp.ts` + teste.
**Produces:**
```ts
// weight.ts
export function sevenDayAverage(entries:{date:string;kg:number}[], dateKey:string): number|null
export function weeklyRate(entries, dateKey): number|null        // negativ = scădere
export function weightProgress(startKg, targetKg, currentKg): {lostKg, remainingKg, percent}
// water.ts
export function waterPercent(totalMl:number, targetMl:number): number   // 0..100, plafonat
// steps.ts
export function stepTargetForDate(dateKey:string, startDate?:string): number
export function weeklyStepAverage(entries:{date:string;count:number}[], dateKey:string): number|null
// bp.ts
export type BpLevel = 'normal'|'atentie'|'ridicata'|'consult'
export function classifyBp(systolic:number, diastolic:number): BpLevel
export function bpLabel(level:BpLevel): string
export function bpAverage(entries:{systolic:number;diastolic:number}[]): {systolic:number;diastolic:number}|null
export function countHighDays(entries:{date:string;systolic:number;diastolic:number}[], dateKey:string, days=30): number
export function addDays(dateKey:string, delta:number): string   // în plan.ts
```
- [ ] Teste + implementare + commit `feat(domain): calcule pentru greutate, apă, pași, tensiune`.

### Task 2: Repo-uri Dexie și backup
**Files:** `src/data/repo/weights.ts`, `water.ts`, `steps.ts`, `bp.ts`, `src/data/backup.ts` + teste.
**Produces:** `putWeight(date,kg)`, `getWeight(date)`, `listWeightsBetween(from,to)`; `addWaterEvent(date, ml, time)`, `undoLastWater(date)`, `getWater(date)`; `putSteps(date,count)`, `getSteps(date)`, `listStepsBetween`; `putBp(entry)`, `getBp(date,slot)`, `listBpBetween`; `exportBackup(): Promise<Backup>`, `importBackup(json:unknown): Promise<void>` (aruncă `BackupError` cu mesaj românesc la structură invalidă), `clearAllData()`.
- [ ] Teste + implementare + commit `feat(data): repo-uri zilnice și backup JSON`.

### Task 3: Componente comune: Sheet, Card, BigNumber, ProgressBar
**Files:** `src/ui/Sheet.tsx` (dialog de jos, `open`, `onClose`, `title`), `src/ui/Card.tsx` (fundal alb, text card-fg, `onClick` opțional → buton), `src/ui/BigNumber.tsx` (valoare + sufix, tabular), `src/ui/ProgressBar.tsx` (`percent`, `tone`).
- [ ] Teste pentru Sheet (se deschide, se închide la Escape și la butonul Închide) + commit `feat(ui): sheet, card, cifre mari, bară de progres`.

### Task 4: Cardurile de pe Azi
**Files:** `src/features/today/WeightCard.tsx`, `WaterCard.tsx`, `StepsCard.tsx`, `BpCard.tsx`, `TodayPage.tsx`, hook `src/features/today/useTodayData.ts` (useLiveQuery pentru ziua curentă + ultimele 14 zile de greutăți).
- Greutate: azi (sau „Notează”), media 7 zile, „−5,2 din 15 kg”, ritm/săpt. Sheet cu NumberField.
- Apă: „2,1 / 3 L”, bară, butoane +250 ml, +500 ml, Anulează ultima.
- Pași: „6.240 / 7.500”, bară, sheet cu câmp întreg.
- Tensiune: două câmpuri AM/PM, valoare sau „Notează”, pastilă de nivel colorată. Sheet cu sistolică, diastolică, puls opțional; mesaj de consult la nivel `consult`.
- [ ] Teste componente (gol / cu date / salvare) + commit `feat(today): cardurile zilei`.

### Task 5: Setări — export, import, ștergere
**Files:** `src/features/settings/SettingsPage.tsx`, rută `/setari`, buton „Setări” în antetul Azi.
- Export: `navigator.share` cu fișier dacă există, altfel `<a download>`; nume `90dayfit-backup-aaaa-ll-zz.json`.
- Import: `<input type=file accept=.json>`, confirmare „Înlocuiește toate datele?”, mesaj de succes/eroare.
- Ștergere: confirmare dublă, apoi `clearAllData()` și revenire la onboarding.
- [ ] Teste + commit `feat(settings): export, import și ștergere`.

### Task 6: E2E
**Files:** `e2e/daily.spec.ts`: notează greutate 129,4, +500 ml de două ori, pași 6240, tensiune AM 126/78 și PM 124/80; reload + PIN → valorile persistă; media 7 zile afișată.
- [ ] Rulează `npm run build && npm run test:e2e` → verde. Commit `test: e2e zilnicul`.

### Task 7: Îmbinare și publicare
- [ ] `npm run check`, îmbinare în `main`, push, verificare pe adresa live.
