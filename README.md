# 90 Day Fit

Aplicație personală pentru iPhone, instalabilă din Safari, care ține evidența planului de transformare de 90 de zile: greutate față de țintă, apă, pași, tensiune arterială dimineața și seara, mese, antrenamente, rețete și evaluarea săptămânală.

Datele rămân pe telefon (IndexedDB). Aplicația se deschide cu PIN și se blochează automat după 5 minute în fundal.

## Comenzi

```powershell
npm install          # o singură dată
npm run dev          # http://localhost:5173/90DayFit/
npm run check        # tsc + teste unitare
npm run test:e2e     # Playwright pe WebKit, profil iPhone 15 (rulează build înainte)
npm run build        # dist/
npm run icons        # regenerează icoanele din public/icons/icon.svg
```

Înainte de `npm run test:e2e` rulează `npm run build`, pentru că testele folosesc `vite preview`.

## Publicare pe GitHub Pages

1. Creează pe GitHub un repository **privat** numit exact `90DayFit` (numele este folosit în calea `/90DayFit/`).
2. În folderul proiectului:
   ```powershell
   git remote add origin https://github.com/<utilizator>/90DayFit.git
   git push -u origin main
   ```
3. În repository: Settings → Pages → Source: **GitHub Actions**.
4. La fiecare push pe `main`, workflow-ul rulează verificările și publică aplicația la `https://<utilizator>.github.io/90DayFit/`.

## Instalare pe iPhone

1. Deschide linkul de mai sus în **Safari** (nu în Chrome).
2. Apasă butonul Partajează (pătratul cu săgeată în sus).
3. Alege **Adaugă pe ecranul principal** și confirmă.
4. Deschide aplicația de pe ecranul principal. La prima deschidere alegi PIN-ul, greutatea de start, ținta și data de start.

Când apare o versiune nouă, aplicația afișează un banner „Versiune nouă disponibilă”. Apasă „Reîncarcă”.

## Structura

```
src/domain/    logică pură, fără React (calcule, reguli, formatare) — testată unitar
src/data/      schema Dexie și acces la date
src/features/  un folder per secțiune: today, progress, meals, workouts, recipes, lock, onboarding
src/ui/        componente comune
src/themes/    variabile CSS pentru teme (implicit: coach)
e2e/           teste Playwright
docs/superpowers/specs și plans   specificația și planurile de implementare
```
