import { STEPS_MAX_PER_DAY } from './steps'

/**
 * Extrage numărul de pași dintr-un text copiat din Comenzi rapide sau Sănătate.
 * Acceptă „6.240”, „6 240”, „6,240”, „6240 pași”, „6240.0”. Returnează null dacă nu găsește un număr plauzibil.
 */
export function parseClipboardSteps(text: string): number | null {
  const cleaned = text.replace(/ /g, ' ').trim()
  const match = cleaned.match(/\d[\d.,\s]*/)
  if (!match) return null
  let token = match[0].trim()
  // „6240.0” sau „6240,0”: zecimală finală de eliminat
  token = token.replace(/[.,]0+$/, '')
  const digits = token.replace(/[.,\s]/g, '')
  if (!/^\d+$/.test(digits)) return null
  const n = Number(digits)
  if (!Number.isInteger(n) || n < 0 || n > STEPS_MAX_PER_DAY) return null
  return n
}

/** Citește clipboard-ul; aruncă o eroare cu mesaj românesc dacă nu se poate. */
export async function readClipboardText(): Promise<string> {
  const clip = navigator.clipboard
  if (!clip || typeof clip.readText !== 'function') throw new Error('Clipboard-ul nu este disponibil în acest browser')
  try {
    return await clip.readText()
  } catch {
    throw new Error('Nu am acces la clipboard. Apasă din nou și permite lipirea.')
  }
}
