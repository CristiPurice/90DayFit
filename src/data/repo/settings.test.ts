import { db } from '../db'
import { getSetting, setSetting, setSettings, getAllSettings } from './settings'

beforeEach(async () => {
  await db.settings.clear()
})

describe('setări', () => {
  it('returnează undefined pentru o cheie nesetată', async () => {
    expect(await getSetting('theme')).toBeUndefined()
  })

  it('păstrează valoarea setată', async () => {
    await setSetting('targetKg', 115)
    expect(await getSetting('targetKg')).toBe(115)
  })

  it('suprascrie valoarea existentă', async () => {
    await setSetting('theme', 'coach')
    await setSetting('theme', 'clinic')
    expect(await getSetting('theme')).toBe('clinic')
  })

  it('setează mai multe chei odată și le citește pe toate', async () => {
    await setSettings({ startKg: 130, onboarded: true })
    await setSetting('theme', 'coach')
    expect(await getAllSettings()).toEqual({ startKg: 130, onboarded: true, theme: 'coach' })
  })
})
