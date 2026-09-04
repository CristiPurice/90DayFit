import type { Macros, MealSlot } from './meals'

export interface Ingredient {
  name: string
  qty: string
}

export interface Recipe {
  id: string
  title: string
  slots: MealSlot[]
  minutes: number
  servings: number
  ingredients: Ingredient[]
  steps: string[]
  macros: Macros
  tags: string[]
}

const r = (
  id: string,
  title: string,
  slots: MealSlot[],
  minutes: number,
  macros: [number, number, number, number],
  ingredients: [string, string][],
  steps: string[],
  tags: string[] = [],
): Recipe => ({
  id,
  title,
  slots,
  minutes,
  servings: 1,
  ingredients: ingredients.map(([name, qty]) => ({ name, qty })),
  steps,
  macros: { kcal: macros[0], protein: macros[1], carbs: macros[2], fat: macros[3] },
  tags,
})

/** 28 de rețete din alimentele planului. Fără pește. Macro per porție, orientative. */
export const RECIPES: Recipe[] = [
  // ——— Mic dejun ———
  r('overnight-oats', 'Overnight oats cu iaurt și banană', ['breakfast'], 5, [490, 28, 70, 9],
    [['Fulgi de ovăz', '70 g'], ['Iaurt grecesc 2%', '200 g'], ['Banană', '1'], ['Scorțișoară', 'un vârf']],
    ['Seara: amestecă ovăzul cu iaurtul într-un borcan.', 'Adaugă banana tăiată rondele și scorțișoara.', 'Închide și lasă la frigider peste noapte. Dimineața se mănâncă rece.'],
    ['fără gătit', 'pregătit seara']),
  r('omleta-pui-rosii', 'Omletă cu pui și roșii', ['breakfast'], 10, [520, 55, 12, 28],
    [['Ouă', '4'], ['Piept de pui gătit', '100 g'], ['Roșie', '1'], ['Ulei de măsline', '1 linguriță'], ['Piper, oregano', 'după gust']],
    ['Taie puiul cubulețe și roșia felii.', 'Bate ouăle cu piper și oregano.', 'Încinge uleiul, pune puiul 1 minut, apoi ouăle. Amestecă ușor 2–3 minute.', 'Adaugă roșia la final.']),
  r('branza-vaci-ovaz', 'Brânză de vaci cu ovăz și fructe de pădure', ['breakfast'], 5, [560, 52, 58, 14],
    [['Brânză de vaci 5%', '300 g'], ['Fulgi de ovăz', '60 g'], ['Fructe de pădure congelate', '150 g'], ['Nuci', '15 g']],
    ['Pune fructele congelate în bol cu 1 minut înainte, se dezgheață în timp ce pregătești restul.', 'Amestecă brânza cu ovăzul.', 'Adaugă fructele și nucile deasupra.'],
    ['fără gătit']),
  r('oua-fierte-paine', 'Ouă fierte cu pâine integrală și castravete', ['breakfast'], 10, [420, 28, 36, 18],
    [['Ouă', '3'], ['Pâine integrală', '2 felii'], ['Castravete', '1'], ['Piper', 'după gust']],
    ['Fierbe ouăle 8 minute din momentul în care apa clocotește.', 'Răcește-le în apă rece, curăță-le.', 'Servește cu pâinea și castravetele tăiat.'],
    ['pregătit în avans']),
  r('terci-ovaz-mar', 'Terci de ovăz cald cu măr și nuci', ['breakfast'], 10, [480, 14, 70, 16],
    [['Fulgi de ovăz', '70 g'], ['Apă sau lapte', '250 ml'], ['Măr', '1'], ['Nuci', '20 g'], ['Scorțișoară', 'un vârf']],
    ['Fierbe ovăzul în apă 4–5 minute, amestecând.', 'Rade mărul și adaugă-l în ultimul minut.', 'Servește cu nuci și scorțișoară.']),
  r('clatite-ovaz', 'Clătite de ovăz cu ou și banană', ['breakfast'], 15, [520, 30, 65, 14],
    [['Fulgi de ovăz', '60 g'], ['Ouă', '2'], ['Banană', '1'], ['Iaurt grecesc', '100 g'], ['Ulei', '1 linguriță']],
    ['Mixează ovăzul, ouăle și banana până devine aluat.', 'Coace clătite mici în tigaie unsă, 2 minute pe parte.', 'Servește cu iaurtul.']),
  r('iaurt-nuci-mar', 'Iaurt grecesc cu nuci, măr și scorțișoară', ['breakfast'], 3, [380, 26, 38, 16],
    [['Iaurt grecesc 2%', '250 g'], ['Măr', '1'], ['Nuci', '20 g'], ['Scorțișoară', 'un vârf']],
    ['Taie mărul cubulețe.', 'Pune totul în bol. Gata.'],
    ['fără gătit', 'rapid']),
  r('scrob-legume', 'Scrob cu ardei și dovlecel', ['breakfast'], 12, [400, 26, 10, 28],
    [['Ouă', '4'], ['Ardei', '½'], ['Dovlecel', '½'], ['Ulei de măsline', '1 linguriță'], ['Piper, boia', 'după gust']],
    ['Călește legumele tăiate mic în ulei, 4–5 minute.', 'Bate ouăle, toarnă-le peste legume, amestecă până se leagă.']),
  r('oua-cuptor-legume', 'Ouă la cuptor cu legume', ['breakfast', 'dinner'], 25, [450, 28, 20, 28],
    [['Ouă', '4'], ['Roșii', '2'], ['Ardei', '1'], ['Ceapă', '½'], ['Ulei de măsline', '1 linguriță'], ['Boia, chimion', 'după gust']],
    ['Călește ceapa și ardeiul, adaugă roșiile tocate și condimentele, lasă 8 minute să scadă.', 'Fă 4 adâncituri, sparge ouăle în ele.', 'Acoperă și lasă 5–6 minute până se coagulează albușul.']),
  r('bol-iaurt-ovaz-copt', 'Bol de iaurt cu ovăz copt și fructe', ['breakfast'], 15, [450, 28, 55, 12],
    [['Fulgi de ovăz', '50 g'], ['Iaurt grecesc', '200 g'], ['Fructe de pădure', '100 g'], ['Nuci', '10 g']],
    ['Întinde ovăzul cu nucile pe o tavă și coace 10 minute la 180°C, până se rumenește.', 'Pune iaurtul în bol, fructele deasupra, ovăzul copt la final pentru crocant.']),

  // ——— Prânz ———
  r('pui-gratar-orez', 'Piept de pui la grătar cu orez și salată', ['lunch', 'dinner'], 25, [790, 68, 81, 20],
    [['Piept de pui', '200 g'], ['Orez', '70 g (crud)'], ['Salată verde, roșii, castravete', '200 g'], ['Ulei de măsline', '1 lingură'], ['Lămâie, oregano, piper', 'după gust']],
    ['Pune orezul la fiert (15 minute).', 'Bate puiul ușor, condimentează, grătar sau tigaie 5–6 minute pe parte.', 'Salata cu ulei și lămâie.']),
  r('salata-pui-paine', 'Salată mare cu pui și pâine integrală', ['lunch'], 15, [620, 58, 45, 22],
    [['Piept de pui gătit', '180 g'], ['Salată verde', '100 g'], ['Roșii, castravete, ardei', '200 g'], ['Pâine integrală', '2 felii'], ['Ulei de măsline', '1 lingură'], ['Lămâie', '½']],
    ['Taie legumele și puiul.', 'Amestecă cu ulei și zeamă de lămâie.', 'Servește cu pâinea.'],
    ['fără gătit dacă puiul e gata']),
  r('wok-pui-legume', 'Orez cu pui și legume la wok', ['lunch', 'dinner'], 20, [720, 62, 78, 16],
    [['Piept de pui', '180 g'], ['Orez', '70 g (crud)'], ['Amestec de legume congelate', '250 g'], ['Usturoi', '1 cățel'], ['Ulei', '1 lingură'], ['Boia, piper', 'după gust']],
    ['Fierbe orezul.', 'Prăjește puiul tăiat fâșii 5 minute în tigaie încinsă.', 'Adaugă legumele și usturoiul, încă 5 minute.', 'Amestecă cu orezul.']),
  r('cartofi-cuptor-pui-broccoli', 'Cartofi la cuptor cu pui și broccoli', ['lunch', 'dinner'], 35, [700, 66, 62, 15],
    [['Piept de pui', '200 g'], ['Cartofi', '300 g'], ['Broccoli', '200 g'], ['Ulei de măsline', '1 lingură'], ['Boia, usturoi, piper', 'după gust']],
    ['Cartofii cubulețe cu ulei și condimente, 20 minute la 200°C.', 'Adaugă puiul condimentat și broccoli, încă 15 minute.'],
    ['o singură tavă']),
  r('bol-pui-orez-iaurt', 'Bol cu pui, orez, castravete și sos de iaurt', ['lunch'], 15, [700, 65, 70, 14],
    [['Piept de pui gătit', '180 g'], ['Orez gătit', '200 g'], ['Castravete', '1'], ['Iaurt grecesc', '100 g'], ['Usturoi, mărar', 'după gust']],
    ['Amestecă iaurtul cu usturoi și mărar.', 'Așază orezul, puiul și castravetele în bol, sosul deasupra.'],
    ['pregătit în avans']),
  r('paste-vita-rosii', 'Paste integrale cu vită tocată și sos de roșii', ['lunch', 'dinner'], 25, [800, 60, 80, 26],
    [['Carne tocată de vită 5–10%', '200 g'], ['Paste integrale', '100 g (crude)'], ['Roșii pasate fără zahăr', '200 g'], ['Ceapă', '½'], ['Usturoi', '1 cățel'], ['Oregano, busuioc', 'după gust']],
    ['Pune pastele la fiert.', 'Rumenește carnea cu ceapa 6–7 minute, adaugă usturoiul și roșiile, lasă 8 minute.', 'Amestecă cu pastele.']),
  r('pui-rotisat-varza', 'Pui rotisat cu salată de varză', ['lunch'], 5, [750, 70, 45, 30],
    [['Pui rotisat (cumpărat), fără piele', '½'], ['Varză albă', '200 g'], ['Morcov', '1'], ['Lămâie, ulei', '1 linguriță'], ['Chiflă integrală', '1']],
    ['Scoate pielea puiului.', 'Varza tăiată fin cu morcov ras, lămâie și puțin ulei.', 'Fără sare adăugată: puiul rotisat e deja sărat.'],
    ['fără gătit', 'rapid']),
  r('salata-vita-tocata', 'Salată caldă de vită tocată cu roșii și ardei', ['lunch', 'dinner'], 20, [550, 50, 15, 30],
    [['Carne tocată de vită', '180 g'], ['Roșii', '2'], ['Ardei', '1'], ['Salată verde', '100 g'], ['Ulei de măsline', '1 linguriță'], ['Chimion, piper', 'după gust']],
    ['Rumenește carnea cu condimente 8 minute.', 'Pune-o caldă peste salata de roșii, ardei și verdețuri.']),
  r('pui-paste-broccoli', 'Pui cu paste integrale și broccoli', ['lunch', 'dinner'], 25, [800, 70, 78, 18],
    [['Piept de pui', '200 g'], ['Paste integrale', '90 g (crude)'], ['Broccoli', '200 g'], ['Usturoi', '2 căței'], ['Ulei de măsline', '1 lingură'], ['Lămâie', '½']],
    ['Fierbe pastele; în ultimele 4 minute adaugă broccoli în aceeași oală.', 'Puiul fâșii, prăjit cu usturoi 6 minute.', 'Amestecă totul cu ulei și zeamă de lămâie.']),

  // ——— Cină ———
  r('pui-cuptor-cartofi-legume', 'Piept de pui la cuptor cu cartofi și legume', ['dinner'], 35, [810, 78, 80, 21],
    [['Piept de pui', '220 g'], ['Cartofi', '350 g'], ['Broccoli, ardei, dovlecel', '300 g'], ['Ulei de măsline', '1 lingură'], ['Boia, usturoi, oregano', 'după gust']],
    ['Cartofii felii, cu jumătate din ulei, 20 minute la 200°C.', 'Adaugă puiul și legumele cu restul de ulei, încă 15 minute.', 'Cina de bază a planului.'],
    ['o singură tavă', 'după antrenament']),
  r('chiftele-curcan-piure', 'Chifteluțe de curcan la cuptor cu piure', ['dinner'], 40, [760, 68, 70, 18],
    [['Piept de curcan tocat', '220 g'], ['Ou', '1'], ['Ceapă', '½'], ['Cartofi', '350 g'], ['Iaurt grecesc', '50 g'], ['Pătrunjel, piper, usturoi', 'după gust']],
    ['Amestecă curcanul cu oul, ceapa tocată și condimentele; formează chiftele.', 'Coace 20 minute la 200°C.', 'Piure: cartofii fierți pasați cu iaurt în loc de unt.']),
  r('vita-dovlecel-orez', 'Vită tocată cu dovlecel și orez', ['dinner'], 25, [780, 62, 75, 24],
    [['Carne tocată de vită', '200 g'], ['Dovlecel', '1'], ['Orez', '70 g (crud)'], ['Roșie', '1'], ['Ulei', '1 linguriță'], ['Chimion, piper', 'după gust']],
    ['Orezul la fiert.', 'Carnea rumenită 7 minute, apoi dovlecelul cubulețe și roșia, 6 minute.', 'Servește peste orez.']),
  r('pui-iaurt-usturoi', 'Pui în sos de iaurt cu usturoi și cartofi', ['dinner'], 30, [740, 72, 65, 18],
    [['Piept de pui', '220 g'], ['Iaurt grecesc', '150 g'], ['Usturoi', '2 căței'], ['Cartofi', '300 g'], ['Lămâie, piper, oregano', 'după gust']],
    ['Marinează puiul 10 minute în iaurt, usturoi, lămâie și oregano.', 'Coace 20 minute la 200°C lângă cartofii tăiați.']),
  r('curcan-tigaie-broccoli', 'Curcan la tigaie cu broccoli și orez', ['dinner'], 25, [720, 70, 70, 16],
    [['Piept de curcan', '220 g'], ['Broccoli', '250 g'], ['Orez', '65 g (crud)'], ['Ulei', '1 lingură'], ['Usturoi, piper', 'după gust']],
    ['Orezul la fiert.', 'Curcanul fâșii, 6 minute în tigaie.', 'Broccoli 5 minute cu puțină apă, capac.']),
  r('tocanita-pui-ardei', 'Tocăniță de pui cu ardei și roșii', ['dinner', 'lunch'], 35, [690, 66, 55, 18],
    [['Piept de pui', '220 g'], ['Ardei', '2'], ['Roșii', '2'], ['Ceapă', '1'], ['Ulei', '1 lingură'], ['Pâine integrală', '2 felii'], ['Boia, cimbru', 'după gust']],
    ['Călește ceapa și ardeiul, adaugă puiul cubulețe 5 minute.', 'Roșiile și condimentele, 15 minute la foc mic.', 'Servește cu pâinea.']),
  r('omleta-cina-branza', 'Omletă de cină cu brânză de vaci și salată', ['dinner'], 10, [480, 45, 12, 26],
    [['Ouă', '3'], ['Brânză de vaci', '150 g'], ['Salată verde, castravete', '150 g'], ['Ulei', '1 linguriță'], ['Mărar, piper', 'după gust']],
    ['Omletă simplă, 3 minute.', 'Brânza cu mărar alături și salata.'],
    ['rapid', 'seară ușoară']),
  r('supa-crema-broccoli-pui', 'Supă cremă de broccoli cu pui', ['dinner'], 30, [520, 55, 30, 18],
    [['Broccoli', '400 g'], ['Piept de pui', '180 g'], ['Cartof', '1'], ['Ceapă', '½'], ['Iaurt grecesc', '50 g'], ['Ulei', '1 linguriță'], ['Piper, nucșoară', 'după gust']],
    ['Fierbe broccoli, cartoful și ceapa 15 minute în 600 ml apă.', 'Pasează cu blenderul, adaugă iaurtul.', 'Puiul fâșii, prăjit separat, pus deasupra.']),
  r('pui-boia-orez-castraveti', 'Pui cu boia, orez și castraveți', ['dinner', 'lunch'], 20, [760, 70, 80, 14],
    [['Piept de pui', '220 g'], ['Orez', '75 g (crud)'], ['Castraveți', '2'], ['Iaurt grecesc', '50 g'], ['Boia dulce, usturoi, piper', 'după gust']],
    ['Orezul la fiert.', 'Puiul dat prin boia și usturoi, tigaie 6 minute pe parte.', 'Castraveții felii cu iaurt și mărar.']),
]

export interface RecipeFilter {
  slot?: MealSlot
  maxMinutes?: number
}

export function filterRecipes(list: Recipe[], filter: RecipeFilter): Recipe[] {
  return list.filter((rec) => {
    if (filter.slot && !rec.slots.includes(filter.slot)) return false
    if (filter.maxMinutes !== undefined && rec.minutes > filter.maxMinutes) return false
    return true
  })
}

export function recipeById(id: string): Recipe | undefined {
  return RECIPES.find((rec) => rec.id === id)
}
