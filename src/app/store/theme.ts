import { create } from 'zustand'
import { DEFAULT_THEME, applyTheme, isThemeId, type ThemeId } from '@/themes/themes'
import { setSetting } from '@/data/repo/settings'

export interface ThemeState {
  theme: ThemeId
  /** Aplică tema fără să o salveze (la pornire, din setări). */
  load: (value: unknown) => void
  /** Aplică și salvează tema aleasă de utilizator. */
  choose: (id: ThemeId) => Promise<void>
}

export const useTheme = create<ThemeState>((set) => ({
  theme: DEFAULT_THEME,
  load: (value) => {
    const id = isThemeId(value) ? value : DEFAULT_THEME
    applyTheme(id)
    set({ theme: id })
  },
  choose: async (id) => {
    applyTheme(id)
    set({ theme: id })
    await setSetting('theme', id)
  },
}))
