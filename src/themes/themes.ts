export type ThemeId = 'coach' | 'clinic' | 'night' | 'rings' | 'ledger'

export interface ThemeMeta {
  id: ThemeId
  name: string
  blurb: string
  /** Culori de previzualizare: fundal, card, accent, text. */
  swatch: [string, string, string, string]
  dark: boolean
}

export const THEMES: ThemeMeta[] = [
  { id: 'coach', name: 'Antrenorul', blurb: 'Cobalt și galben, cifre uriașe. Energie de vestiar.', swatch: ['#1b3fd6', '#ffffff', '#ffd23f', '#0f1a3d'], dark: false },
  { id: 'clinic', name: 'Clinic', blurb: 'Alb și albastru-petrol, calm, apropiat de Apple Health.', swatch: ['#f6f8fb', '#ffffff', '#0e7c86', '#12203a'], dark: false },
  { id: 'night', name: 'Tura de noapte', blurb: 'Grafit și chihlimbar, contrast mare pentru 5 dimineața.', swatch: ['#101114', '#191b20', '#f2a93b', '#f2efe8'], dark: true },
  { id: 'rings', name: 'Inele', blurb: 'Coral și mentă pe crem, rotunjit și cald.', swatch: ['#fff7f2', '#ffffff', '#ff6b57', '#2d2331'], dark: false },
  { id: 'ledger', name: 'Registrul', blurb: 'Verde-oțel, cifre monospațiate, totul la vedere.', swatch: ['#eef1ee', '#f8faf8', '#0f8a5f', '#14201a'], dark: false },
]

export const DEFAULT_THEME: ThemeId = 'coach'

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEMES.some((t) => t.id === value)
}

/** Aplică tema pe document: atributul data-theme și culoarea barei de stare iOS. */
export function applyTheme(id: ThemeId): void {
  const root = document.documentElement
  root.dataset.theme = id
  const meta = THEMES.find((t) => t.id === id) ?? THEMES[0]!
  root.style.colorScheme = meta.dark ? 'dark' : 'light'
  const tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (tag) tag.content = meta.swatch[0]
}
