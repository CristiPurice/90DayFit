/** Formatare și parsare în convenții românești. Fără dependențe de React. */

const pad2 = (n: number) => String(n).padStart(2, '0')

/** 'aaaa-ll-zz' pentru data locală. */
export function todayKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
}

/** '2026-09-07' → '07.09.2026' */
export function formatDate(key: string): string {
  const [y, m, d] = key.split('-')
  if (!y || !m || !d) return key
  return `${d}.${m}.${y}`
}

/** 124.8 → '124,8'; 125 → '125,0' */
export function formatKg(kg: number, digits = 1): string {
  return kg.toFixed(digits).replace('.', ',')
}

/** 6240 → '6.240' */
export function formatInt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Acceptă '124,8' sau '124.8'. Returnează null dacă nu e număr. */
export function parseDecimal(input: string): number | null {
  const cleaned = input.trim().replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}
