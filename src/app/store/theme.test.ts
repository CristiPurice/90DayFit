import { db } from '@/data/db'
import { getSetting } from '@/data/repo/settings'
import { useTheme } from './theme'
import { THEMES, isThemeId } from '@/themes/themes'

beforeEach(async () => {
  await db.settings.clear()
  document.documentElement.dataset.theme = ''
})

describe('teme', () => {
  it('sunt 5, cu id-uri valide', () => {
    expect(THEMES.map((t) => t.id)).toEqual(['coach', 'clinic', 'night', 'rings', 'ledger'])
    expect(isThemeId('night')).toBe(true)
    expect(isThemeId('altceva')).toBe(false)
  })

  it('load aplică tema fără să o salveze și cade pe coach la valori necunoscute', async () => {
    useTheme.getState().load('clinic')
    expect(document.documentElement.dataset.theme).toBe('clinic')
    expect(await getSetting('theme')).toBeUndefined()
    useTheme.getState().load('inexistent')
    expect(document.documentElement.dataset.theme).toBe('coach')
  })

  it('choose aplică, salvează și setează color-scheme pentru tema întunecată', async () => {
    await useTheme.getState().choose('night')
    expect(useTheme.getState().theme).toBe('night')
    expect(document.documentElement.dataset.theme).toBe('night')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(await getSetting('theme')).toBe('night')
    await useTheme.getState().choose('rings')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })
})
