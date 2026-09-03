# Faza 0: Fundație — plan de implementare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O PWA instalabilă pe iPhone, numită „90 Day Fit", cu tema C (Antrenorul), ecran de PIN, asistent inițial și cinci taburi goale, cu CI care rulează testele și publică pe GitHub Pages.

**Architecture:** React 19 + Vite 6 + TypeScript strict. Logica pură în `src/domain/` (fără React), datele în Dexie (`src/data/`), interfața în `src/features/` și `src/ui/`. Tema este un set de variabile CSS aplicate pe `<html data-theme="coach">`. Router cu hash (`/#/azi`) ca să funcționeze pe GitHub Pages fără rescrieri de server.

**Tech Stack:** react 19, react-router 7, vite 6, typescript 5, tailwindcss 4, dexie 4, zustand 5, vite-plugin-pwa, @fontsource/archivo, vitest 3, @testing-library/react, fake-indexeddb, @playwright/test, sharp (doar pentru generarea icoanelor).

## Global Constraints

- Nume aplicație: „90 Day Fit" (manifest `name` și `short_name`).
- Temă implicită: `coach`; cobalt `#1b3fd6`, galben `#ffd23f`, text pe cobalt `#ffffff`, text pe card `#0f1a3d`, font „Archivo".
- Limbă: română, dată `zz.ll.aaaa`, zecimale cu virgulă.
- Fără resurse externe la runtime (fonturi împachetate local, CSP `default-src 'self'`).
- PIN 4–6 cifre, PBKDF2-SHA256 100.000 iterații, salt 16 octeți, blocare automată la 5 minute.
- Datele calendaristice ca `aaaa-ll-zz` în fusul local.
- `src/domain/` nu importă React, Dexie sau `features/`.
- Toate comenzile se rulează din PowerShell, din `E:\Claude_projects\90DayFit`.
- Fiecare task se termină cu `npm run check` verde (tsc + vitest) și commit.

---

## Harta fișierelor

| Fișier | Responsabilitate |
|---|---|
| `package.json`, `vite.config.ts`, `tsconfig*.json`, `vitest.config.ts`, `playwright.config.ts` | configurare |
| `index.html` | shell HTML, meta viewport iOS, CSP, `lang="ro"` |
| `src/main.tsx` | montare React, import fonturi și CSS |
| `src/app/App.tsx` | router, gardă de blocare/onboarding, shell cu TabBar |
| `src/app/routes.ts` | lista taburilor: cale, etichetă |
| `src/themes/tokens.css` | variabilele de temă și valorile pentru `coach` |
| `src/themes/base.css` | reset, Tailwind, reguli globale |
| `src/domain/plan.ts` | constantele planului (date, ținte, calorii, faze) |
| `src/domain/format.ts` | `formatKg`, `formatDate`, `todayKey`, `parseDecimal` |
| `src/domain/pin.ts` | `hashPin`, `verifyPin`, `isValidPin` |
| `src/data/db.ts` | schema Dexie v1 |
| `src/data/repo/settings.ts` | `getSetting`, `setSetting`, `getAllSettings` |
| `src/app/store/lock.ts` | store Zustand: `locked`, `lastActiveAt`, `unlock`, `lock`, `touch` |
| `src/features/lock/LockScreen.tsx` | tastatură PIN, verificare |
| `src/features/onboarding/Onboarding.tsx` | 4 pași: PIN, greutate start, țintă, dată start |
| `src/features/{today,progress,meals,workouts,recipes}/*Page.tsx` | pagini goale cu titlu |
| `src/ui/TabBar.tsx`, `src/ui/PinPad.tsx`, `src/ui/NumberField.tsx`, `src/ui/Button.tsx` | componente comune |
| `public/icons/*.png`, `scripts/make-icons.mjs` | icoane PWA generate din SVG |
| `.github/workflows/ci.yml` | tsc, vitest, playwright, build, deploy Pages |
| `README.md` | instalare pe iPhone, comenzi |

---

### Task 1: Schelet de proiect și lanțul de verificare

**Files:** `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `vitest.config.ts`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/themes/base.css`, `src/domain/smoke.test.ts`

**Produces:** scripturile `dev`, `build`, `test`, `test:e2e`, `check`, `preview`.

- [ ] **Step 1:** `npm create vite@latest . -- --template react-ts` (în folder gol; păstrează docs/). Instalează: `npm i react-router dexie zustand @fontsource/archivo` și `npm i -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fake-indexeddb @playwright/test vite-plugin-pwa sharp`.
- [ ] **Step 2:** `tsconfig.app.json`: `"strict": true, "noUncheckedIndexedAccess": true, "noUnusedLocals": true, "types": ["vitest/globals"]`, alias `@/*` → `src/*`.
- [ ] **Step 3:** `vite.config.ts` cu `react()`, `tailwindcss()`, alias `@`, `base: '/90DayFit/'` (numele repo-ului GitHub) și `test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'] }`.
- [ ] **Step 4:** `src/domain/smoke.test.ts`: `expect(1 + 1).toBe(2)`. `package.json` scripts: `"check": "tsc -b && vitest run"`.
- [ ] **Step 5:** Run `npm run check` → PASS. `npm run build` → `dist/` creat.
- [ ] **Step 6:** `.gitignore` (node_modules, dist, playwright-report, test-results). Commit `chore: schelet Vite + React + TS + Vitest`.

### Task 2: Tema „coach" și tipografia

**Files:** `src/themes/tokens.css`, `src/themes/base.css`, `src/main.tsx`, `index.html`

**Produces:** variabilele `--bg`, `--fg`, `--muted`, `--card`, `--card-fg`, `--card-muted`, `--line`, `--accent`, `--accent-fg`, `--good`, `--warn`, `--danger`, `--tab-bg`; clasa utilitară Tailwind prin `@theme`.

- [ ] **Step 1:** `tokens.css`:
```css
:root, [data-theme="coach"] {
  --bg:#1b3fd6; --fg:#ffffff; --muted:#c6d2ff;
  --card:#ffffff; --card-fg:#0f1a3d; --card-muted:#5a6690; --line:#e3e7f3;
  --accent:#ffd23f; --accent-fg:#0f1a3d; --good:#1f9d63; --warn:#d98a1f; --danger:#c0392b;
  --tab-bg:#122ea8; --font:"Archivo","Segoe UI",system-ui,sans-serif;
}
```
- [ ] **Step 2:** `base.css`: `@import "tailwindcss"; @import "./tokens.css";` plus `@theme inline { --color-bg: var(--bg); ... --font-sans: var(--font); }`, `html{background:var(--bg);color:var(--fg);font-family:var(--font)}`, `body{margin:0;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}`, `.num{font-variant-numeric:tabular-nums}`.
- [ ] **Step 3:** `main.tsx` importă `@fontsource/archivo/400.css`, `/600.css`, `/700.css`, `/900.css` și `./themes/base.css`. `index.html`: `<html lang="ro" data-theme="coach">`, `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`, `<meta name="theme-color" content="#1b3fd6">`, CSP meta `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'`.
- [ ] **Step 4:** `npm run build` → PASS; verifică în `dist/assets` că fonturile Archivo sunt incluse. Commit `feat: tema coach și fontul Archivo`.

### Task 3: Constantele planului și formatarea românească

**Files:** `src/domain/plan.ts`, `src/domain/format.ts`, teste alături.

**Produces:**
```ts
// plan.ts
export const PLAN = { startDate:'2026-09-07', endDate:'2026-12-06', startKg:130, targetKg:115, waistStartCm:115,
  calorieTarget:2400, calorieMin:2100, proteinMinG:170, proteinMaxG:200, waterTargetMl:3000,
  stepTargets:[{fromWeek:1,steps:6000},{fromWeek:3,steps:7500},{fromWeek:5,steps:9000},{fromWeek:9,steps:10000}] } as const;
export function weekNumber(dateKey:string): number   // 1..13, 0 înainte de start, 14+ după
export function dayNumber(dateKey:string): number    // 1..91
export function stepTargetForWeek(week:number): number
// format.ts
export function todayKey(now?:Date): string          // 'aaaa-ll-zz' local
export function formatDate(key:string): string       // '07.09.2026'
export function formatKg(kg:number, digits?:number): string  // '124,8'
export function parseDecimal(input:string): number|null      // acceptă '124,8' și '124.8'
```
- [ ] **Step 1:** Teste: `weekNumber('2026-09-07')=1`, `('2026-09-13')=1`, `('2026-09-14')=2`, `('2026-12-06')=13`, `('2026-09-06')=0`; `dayNumber('2026-09-30')=24`; `stepTargetForWeek(4)=7500`, `(9)=10000`; `formatKg(124.8)='124,8'`, `formatKg(125)='125,0'`; `parseDecimal('124,8')=124.8`, `parseDecimal('abc')=null`; `todayKey(new Date(2026,8,3))='2026-09-03'`; `formatDate('2026-09-07')='07.09.2026'`.
- [ ] **Step 2:** Rulează → FAIL. Implementează. Rulează → PASS. Commit `feat(domain): constante plan și formatare ro`.

### Task 4: Baza de date Dexie și setările

**Files:** `src/data/db.ts`, `src/data/repo/settings.ts`, `src/test/setup.ts`, teste.

**Produces:**
```ts
export type SettingKey = 'startDate'|'startKg'|'targetKg'|'waistStartCm'|'calorieTarget'|'theme'|'pinHash'|'pinSalt'|'lockTimeoutMin'|'onboarded';
export type Settings = Partial<{startDate:string; startKg:number; targetKg:number; waistStartCm:number; calorieTarget:number; theme:string; pinHash:string; pinSalt:string; lockTimeoutMin:number; onboarded:boolean}>;
export async function getSetting<K extends keyof Settings>(key:K): Promise<Settings[K]|undefined>
export async function setSetting<K extends keyof Settings>(key:K, value:NonNullable<Settings[K]>): Promise<void>
export async function getAllSettings(): Promise<Settings>
```
Schema v1 (toate tabelele din spec, chiar dacă faza 0 folosește doar `settings`): `weights:'date'`, `water:'date'`, `steps:'date'`, `bp:'[date+slot],date'`, `workouts:'date'`, `sets:'++id,date'`, `meals:'[date+slot],date'`, `reviews:'weekNo'`, `settings:'key'`.
- [ ] **Step 1:** `src/test/setup.ts`: `import 'fake-indexeddb/auto'; import '@testing-library/jest-dom/vitest';`. Test: set apoi get returnează valoarea; `getAllSettings` după două seturi returnează ambele; `getSetting('theme')` inițial `undefined`.
- [ ] **Step 2:** FAIL → implementează `db.ts` (clasa `AppDB extends Dexie`, `export const db = new AppDB()`) și `settings.ts` → PASS. Commit `feat(data): schema Dexie v1 și setări`.

### Task 5: PIN și starea de blocare

**Files:** `src/domain/pin.ts`, `src/app/store/lock.ts`, teste.

**Produces:**
```ts
export function isValidPin(pin:string): boolean   // 4–6 cifre
export async function hashPin(pin:string, saltB64?:string): Promise<{hash:string; salt:string}>  // PBKDF2-SHA256 100000, base64
export async function verifyPin(pin:string, hash:string, salt:string): Promise<boolean>          // comparație timp constant
// lock.ts (zustand)
interface LockState { locked:boolean; lastActiveAt:number; failedAttempts:number; lock():void; unlock():void; touch():void; registerFailure():void; resetFailures():void }
export const useLock = create<LockState>(...)
export const LOCK_TIMEOUT_MS = 5*60*1000
export function shouldLock(lastActiveAt:number, now:number): boolean
export function failureDelayMs(failedAttempts:number): number // 0,0,0,2000,4000,8000... plafon 30000
```
- [ ] **Step 1:** Teste: `isValidPin('1234')` true, `('123')` false, `('12a4')` false, `('1234567')` false; `hashPin` returnează hash diferit la salt diferit și identic la același salt; `verifyPin` corect/greșit; `shouldLock(0, 5*60*1000+1)` true, `(0, 1000)` false; `failureDelayMs(2)=0`, `(3)=2000`, `(4)=4000`, `(10)=30000`; store: `unlock()` → `locked=false`, `lock()` → `true`.
- [ ] **Step 2:** FAIL → implementează cu `globalThis.crypto.subtle` → PASS. Commit `feat: PIN cu PBKDF2 și store de blocare`.

### Task 6: Shell cu 5 taburi

**Files:** `src/app/routes.ts`, `src/ui/TabBar.tsx`, `src/features/today/TodayPage.tsx` (+ progress, meals, workouts, recipes), `src/app/App.tsx`, test `App.test.tsx`.

**Produces:** `ROUTES = [{path:'/azi',label:'Azi'},{path:'/progres',label:'Progres'},{path:'/mese',label:'Mese'},{path:'/sala',label:'Sală'},{path:'/retete',label:'Rețete'}]`; `<TabBar/>` cu `NavLink`, aria-current pe activ; `HashRouter`; redirect `/` → `/azi`.
- [ ] **Step 1:** Test: randare `<App/>` cu setările `onboarded=true` și store `locked=false` → apar 5 linkuri cu etichetele; click pe „Progres" → heading „Progres".
- [ ] **Step 2:** FAIL → implementează. Paginile: `<main class="p-4"><h1 class="text-2xl font-black uppercase">Azi</h1><p class="text-[var(--muted)]">Se construiește în faza 1.</p></main>`. TabBar fix jos, `padding-bottom: env(safe-area-inset-bottom)`, fundal `--tab-bg`. → PASS. Commit `feat: shell cu 5 taburi`.

### Task 7: Onboarding și ecranul de PIN

**Files:** `src/ui/PinPad.tsx`, `src/ui/NumberField.tsx`, `src/ui/Button.tsx`, `src/features/lock/LockScreen.tsx`, `src/features/onboarding/Onboarding.tsx`, `src/app/App.tsx` (gardă), teste.

**Interfaces:** `<PinPad value onChange onSubmit maxLength=6 />` (butoane 0–9, ștergere, OK); `<NumberField label value onChange suffix inputMode="decimal" />` folosește `parseDecimal`; `<Button variant="accent"|"ghost" />`.

Onboarding, 4 pași, precompletat din `PLAN`: (1) „Alege un PIN" + confirmare, (2) greutate de start 130, (3) țintă 115, (4) dată start 07.09.2026. La final: `setSetting('pinHash')`, `('pinSalt')`, `('startKg')`, `('targetKg')`, `('startDate')`, `('theme','coach')`, `('lockTimeoutMin',5)`, `('onboarded',true)`, apoi `unlock()`.

LockScreen: titlu „90 Day Fit", PinPad, la PIN greșit mesaj „PIN greșit" și `registerFailure()`; respectă `failureDelayMs`. La corect `unlock()`.

App: `useEffect` care încarcă setările; dacă `!onboarded` → `<Onboarding/>`; altfel dacă `locked` → `<LockScreen/>`; altfel shell. Listener `visibilitychange`: la ascundere `touch()`, la revenire `if (shouldLock(lastActiveAt, Date.now())) lock()`. La montare inițială `locked=true`.
- [ ] **Step 1:** Teste componente: PinPad — apăsarea „1","2","3","4" produce `onChange('1234')`; NumberField — tastarea „124,8" produce `onChange(124.8)`; Onboarding — parcurgerea celor 4 pași cu PIN „1234" scrie `onboarded=true` și `pinHash` nevid în Dexie; LockScreen — cu hash pentru „1234", tastarea „9999" arată „PIN greșit", tastarea „1234" apelează `unlock`.
- [ ] **Step 2:** FAIL → implementează → PASS. Commit `feat: onboarding și ecran de PIN`.

### Task 8: PWA: manifest, icoane, service worker

**Files:** `scripts/make-icons.mjs`, `public/icons/icon.svg`, `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon-180.png`, `maskable-512.png`, `vite.config.ts`, `index.html`, `src/app/UpdateBanner.tsx`.

- [ ] **Step 1:** `icon.svg`: fundal cobalt `#1b3fd6` rotunjit, textul „90" galben `#ffd23f`, font-weight 900. `make-icons.mjs` cu sharp generează cele 4 PNG-uri. Script `"icons": "node scripts/make-icons.mjs"`. Rulează.
- [ ] **Step 2:** `VitePWA({ registerType:'prompt', includeAssets:['icons/*.png'], manifest:{ name:'90 Day Fit', short_name:'90 Day Fit', lang:'ro', start_url:'/90DayFit/#/azi', scope:'/90DayFit/', display:'standalone', background_color:'#1b3fd6', theme_color:'#1b3fd6', icons:[192, 512, maskable] }, workbox:{ globPatterns:['**/*.{js,css,html,woff2,png,svg}'], navigateFallback:'/90DayFit/index.html' } })`. `index.html`: `<link rel="apple-touch-icon" href="/90DayFit/icons/apple-touch-icon-180.png">`.
- [ ] **Step 3:** `UpdateBanner.tsx` cu `useRegisterSW` din `virtual:pwa-register/react`: când `needRefresh` → banner jos „Versiune nouă disponibilă" cu buton „Reîncarcă". Montat în App.
- [ ] **Step 4:** `npm run build` → `dist/manifest.webmanifest` și `dist/sw.js` există. Commit `feat: PWA instalabilă`.

### Task 9: Teste end-to-end pe WebKit iPhone

**Files:** `playwright.config.ts`, `e2e/onboarding.spec.ts`, `e2e/lock.spec.ts`, `e2e/offline.spec.ts`.

- [ ] **Step 1:** `npx playwright install webkit`. Config: `webServer: { command:'npm run preview -- --port 4173', url:'http://localhost:4173/90DayFit/' }`, `use: { ...devices['iPhone 15'] }`, project `webkit`.
- [ ] **Step 2:** `onboarding.spec.ts`: deschide `/90DayFit/`, parcurge 4 pași cu PIN 1234, verifică heading „Azi" și 5 taburi. `lock.spec.ts`: după onboarding, reîncarcă pagina → ecran PIN; PIN greșit → „PIN greșit"; PIN corect → „Azi". `offline.spec.ts`: după prima încărcare, `context.setOffline(true)`, reload → heading încă vizibil.
- [ ] **Step 3:** Rulează `npm run test:e2e` → 3 PASS. Commit `test: e2e onboarding, blocare, offline`.

### Task 10: CI și deploy pe GitHub Pages, README

**Files:** `.github/workflows/ci.yml`, `README.md`.

- [ ] **Step 1:** Workflow: `on: push (main), pull_request`; job `verify`: checkout, node 22, `npm ci`, `npx tsc -b`, `npm test -- --run`, `npx playwright install --with-deps webkit`, `npm run test:e2e`, `npm run build`, upload artifact `dist`; job `deploy` (doar pe main, needs verify): `actions/deploy-pages`.
- [ ] **Step 2:** README: ce este, comenzi, pașii de creare a repo-ului privat `90DayFit` pe GitHub, activarea Pages cu sursa „GitHub Actions", instalarea pe iPhone (Safari → Partajează → Adaugă pe ecranul principal), unde sunt datele și cum se face export.
- [ ] **Step 3:** Commit `ci: verificare și deploy pe GitHub Pages`.

---

## Self-review

- Spec coverage faza 0: proiect ✓ (T1), tema C ✓ (T2), 5 taburi ✓ (T6), PIN cu PBKDF2 și blocare 5 min ✓ (T5, T7), asistent inițial ✓ (T7), PWA instalabilă ✓ (T8), CI cu deploy ✓ (T10), teste e2e WebKit și offline ✓ (T9), CSP și fonturi locale ✓ (T2). Lighthouse CI amânat pentru faza 1 (T10 poate adăuga `treosh/lighthouse-ci-action` după primul deploy real).
- Tipuri: `Settings`, `getSetting/setSetting` folosite identic în T4, T7; `useLock`, `shouldLock`, `failureDelayMs` identice în T5, T7; `parseDecimal` în T3 și T7.
