import { parseClipboardSteps, readClipboardText } from './clipboard'

describe('parseClipboardSteps', () => {
  it('acceptă formatele uzuale', () => {
    expect(parseClipboardSteps('6240')).toBe(6240)
    expect(parseClipboardSteps('6.240')).toBe(6240)
    expect(parseClipboardSteps('6,240')).toBe(6240)
    expect(parseClipboardSteps('6 240 pași')).toBe(6240)
    expect(parseClipboardSteps('Pași: 6240.0')).toBe(6240)
    expect(parseClipboardSteps('  10.842,0 \n')).toBe(10842)
  })
  it('respinge texte fără număr sau valori implauzibile', () => {
    expect(parseClipboardSteps('')).toBeNull()
    expect(parseClipboardSteps('azi')).toBeNull()
    expect(parseClipboardSteps('99999999')).toBeNull()
  })
})

describe('readClipboardText', () => {
  it('returnează textul sau o eroare clară', async () => {
    Object.assign(navigator, { clipboard: { readText: async () => '6240' } })
    expect(await readClipboardText()).toBe('6240')
    Object.assign(navigator, {
      clipboard: {
        readText: async () => {
          throw new Error('denied')
        },
      },
    })
    await expect(readClipboardText()).rejects.toThrow(/Nu am acces la clipboard/)
    Object.assign(navigator, { clipboard: undefined })
    await expect(readClipboardText()).rejects.toThrow(/nu este disponibil/)
  })
})
