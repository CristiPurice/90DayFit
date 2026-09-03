# 90 Day Fit: specificație de design

Data: 3 septembrie 2026. Stare: aprobată de utilizator (răspunsuri la întrebările din planul inițial).

## 1. Scop

Aplicație personală pentru iPhone, folosită zilnic timp de 90 de zile (7 septembrie – 6 decembrie 2026), care ține evidența planului de transformare: greutate față de țintă, apă, pași, tensiune arterială dimineața și seara, mesele planificate, antrenamentele, rețete din alimentele planului, evaluarea săptămânală. Un singur utilizator. Datele sunt medicale și rămân pe telefon.

## 2. Decizii luate

| Subiect | Decizie |
|---|---|
| Platformă | PWA instalabilă din Safari („Adaugă pe ecranul principal"). Capacitor reevaluat după 30 de zile de folosire. |
| Nume | **90 Day Fit** (sub icoană: „90 Day Fit") |
| Temă implicită | **C, „Antrenorul"**: cobalt `#1b3fd6`, galben `#ffd23f`, carduri albe, cifre uriașe, font Archivo. Celelalte 4 teme (A, B, D, E) vin în faza 5. |
| Securitate la deschidere | PIN de 4–6 cifre, hash PBKDF2 stocat local, blocare automată după 5 minute în fundal. Fără Face ID în prima versiune. |
| Date | Local, în IndexedDB (Dexie). Export și import JSON din faza 1. Sincronizare cloud (Supabase) în faza 5, ca opțiune. |
| Găzduire | GitHub Pages din repository privat pe contul utilizatorului, deploy prin GitHub Actions la fiecare push pe `main`. HTTPS gratuit. Fără cont nou. |
| Pași | Introduși manual, o valoare pe zi. Comandă rapidă iOS în faza 5. |
| Tensiune | Sistolică, diastolică, puls opțional, două momente pe zi: dimineață și seară. |
| Rețete | Bază locală de 25–30 de rețete scrise din alimentele planului, fără pește. Fără AI în prima versiune. |
| Mese | Trei mese pe zi, fiecare cu varianta de bază și două alternative. Utilizatorul bifează masa și poate alege alternativa; caloriile zilei se recalculează. |
| Sală | Programele A/B/C din plan, jurnal de seturi (kg × repetări), cronometru de pauză cu vibrație, regula somnului prost aplicată automat. |
| Notificări | Nu în primele 4 faze. |
| Limbă și formate | Română, dată `zz.ll.aaaa`, zecimale cu virgulă, unități metrice. |
| Mod întunecat | Tema rămâne fixă până o schimbă utilizatorul. |
| Proiect | `E:\Claude_projects\90DayFit`, repository Git propriu. |

## 3. Arhitectură

### Stack

- TypeScript strict, React 19, Vite 6, React Router (5 taburi).
- Tailwind CSS v4 cu variabile CSS pentru teme.
- Dexie 4 (IndexedDB) pentru date; Zustand pentru starea de UI (temă, blocare, tab activ).
- vite-plugin-pwa (Workbox) pentru manifest, service worker, actualizare automată.
- Recharts pentru grafice.
- Vitest + Testing Library pentru unitar și componente; Playwright (WebKit, profil iPhone 15) pentru end-to-end; Lighthouse CI pentru PWA.

### Structura

```
src/
  app/          App.tsx, router, shell cu bara de taburi, ecranul de PIN, furnizorul de temă
  domain/       logică pură, fără React: calcule și reguli (testată 100%)
    weight.ts   media 7 zile, ritm săptămânal, proiecție, procent din țintă
    bp.ts       clasificare (normal / atenție / consult), medii AM/PM, contor 30 zile
    water.ts    sumă zilnică, procent din țintă
    steps.ts    ținta pe săptămâni din plan, medie săptămânală
    workouts.ts programele A/B/C, regula somnului (sub 5h: −1 set, fără cardio; sub 4h: doar mers)
    meals.ts    planul zilnic, recalcularea caloriilor la alegerea alternativei
    review.ts   cele 10 întrebări, regulile de ajustare
    plan.ts     constantele planului: date, ținte, calorii, faze
    format.ts   formatare română pentru numere și date
  data/
    db.ts       schema Dexie
    repo/       un fișier per tabel, funcții CRUD tipate
    backup.ts   export/import JSON cu versiune de schemă
  features/     un folder per tab: today, progress, meals, workouts, recipes; plus bp, settings, lock
  ui/           componente comune: Card, BigNumber, ProgressBar, NumberField, TabBar, Sheet
  themes/       tokens.css (variabile), coach.css (C), apoi clinic, night, rings, ledger
```

Regula de dependență: `domain/` nu importă din `data/`, `features/` sau React. `features/` importă din `domain/`, `data/`, `ui/`.

### Model de date (Dexie, versiunea 1)

| Tabel | Cheie | Câmpuri |
|---|---|---|
| weights | date (aaaa-ll-zz) | kg, note? |
| water | date | totalMl, events: {time, ml}[] |
| steps | date | count, source: 'manual' |
| bp | [date+slot] | slot: 'am' \| 'pm', systolic, diastolic, pulse?, time, note? |
| workouts | date | program: 'A' \| 'B' \| 'C', sleepHours?, completed, cardioMinutes, note? |
| sets | id++ | date, exercise, setNo, weightKg, reps |
| meals | [date+slot] | slot: 'breakfast' \| 'lunch' \| 'dinner', optionId, followed |
| reviews | weekNo | date, answers: string[10], decision |
| settings | key | value (JSON): startDate, startKg, targetKg, waistStartCm, calorieTarget, theme, pinHash, pinSalt, lockTimeoutMin |

Datele calendaristice sunt în fusul local, ca șir `aaaa-ll-zz`. Validări: greutate 40–300 kg, sistolică 60–250, diastolică 30–150, puls 30–220, apă 0–8.000 ml/zi, pași 0–60.000.

### Fluxuri principale

- **Deschidere:** ecranul de PIN; la PIN corect se afișează tab-ul Azi. Blocare automată când aplicația stă în fundal peste 5 minute (eveniment `visibilitychange` + timestamp).
- **Azi:** carduri în ordinea: greutate (introducere rapidă), apă (+250 / +500 ml), pași, tensiune AM/PM, antrenamentul zilei, mesele zilei. Fiecare card deschide un sheet de introducere. Salvare imediată în Dexie.
- **Progres:** grafice pe 90 de zile cu greutate zilnică și medie 7 zile, linia țintei, talie, tensiune AM/PM, pași, aderență la mese. Buton „Evaluarea de duminică" cu cele 10 întrebări și recomandarea automată din regulile de ajustare.
- **Mese:** ziua curentă cu 3 mese, fiecare cu varianta de bază și 2 alternative, bifă „conform planului". Totalul zilei se recalculează.
- **Sală:** programul zilei (A luni, B miercuri, C vineri), întrebare „ore de somn" la început, aplicarea regulii somnului, listă de exerciții cu seturi de notat, cronometru de pauză, finalizare.
- **Rețete:** listă filtrabilă după masă și timp de gătit, detaliu cu ingrediente, cantități, macro, pași.
- **Setări:** țintă, calorii, temă, schimbare PIN, export JSON, import JSON, ștergere completă.

### Erori și cazuri limită

- Valoare în afara intervalului: câmpul afișează mesaj concret și nu salvează.
- Zi fără date: cardurile arată starea „nenotat" cu buton, nu zero.
- Prima deschidere: asistent scurt (PIN, greutate de start, țintă, dată de start), cu valorile din plan precompletate.
- Actualizare PWA: la detectarea unei versiuni noi, banner „Versiune nouă, reîncarcă".
- Import JSON: validare de schemă înainte de scriere; import atomic (totul sau nimic).

## 4. Securitate

- HTTPS prin GitHub Pages. Service worker doar pe origine proprie.
- PIN: PBKDF2-SHA256, 100.000 iterații, salt aleator, prin Web Crypto. Comparație în timp constant. Trei încercări greșite adaugă o întârziere progresivă.
- Fără scripturi, fonturi sau resurse externe la runtime. Fontul Archivo este împachetat local.
- CSP prin meta tag: `default-src 'self'`.
- Export JSON conține date medicale: dialogul de export avertizează unde se salvează.
- Dependențe cu versiuni fixate, `npm audit` în CI.

## 5. Testare

- `domain/`: Vitest, acoperire 100% pe linii, scrise înaintea codului.
- Componente: Testing Library pentru stările gol / parțial / complet ale fiecărui card.
- E2E Playwright WebKit iPhone 15: PIN, notare greutate, apă, tensiune AM și PM, bifare masă, antrenament complet cu seturi, export/import, schimbare temă, funcționare offline.
- Lighthouse CI: categoria PWA la 100, accesibilitate peste 90.
- CI pe GitHub Actions: tsc, vitest, playwright, lighthouse, apoi deploy pe Pages doar dacă totul e verde.
- Verificare reală: utilizatorul instalează aplicația pe iPhone la finalul fazei 0 și confirmă înainte de faza 1.

## 6. Faze

| Fază | Livrabil |
|---|---|
| 0. Fundație | Proiect, tema C, shell cu 5 taburi, PIN, asistent inițial, PWA instalabilă, CI cu deploy pe Pages |
| 1. Zilnicul | Greutate, apă, pași, tensiune AM/PM, dashboard Azi, export/import JSON |
| 2. Mese și rețete | Planul pe zile cu alternative, aderență, 25–30 rețete |
| 3. Sala | Programele A/B/C, jurnal de seturi, cronometru, regula somnului |
| 4. Progres | Grafice 90 de zile, evaluarea de duminică, reguli de ajustare |
| 5. Extensii | Temele A, B, D, E; Supabase sync opțional; Comandă rapidă pentru pași; notificări |

## 7. În afara scopului (prima versiune)

Conturi multiple, Face ID, HealthKit, Apple Watch, widget-uri, notificări push, generare de rețete cu AI, App Store.
