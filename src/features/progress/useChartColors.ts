import { useMemo } from 'react'
import { useTheme } from '@/app/store/theme'

export interface ChartColors {
  s1: string
  s2: string
  ink: string
  muted: string
  grid: string
  danger: string
}

/** Culori de rezervă (tema coach) pentru medii fără CSS, de exemplu testele. */
const FALLBACK: ChartColors = { s1: '#1b3fd6', s2: '#d97706', ink: '#0f1a3d', muted: '#5a6690', grid: '#e3e7f3', danger: '#c0392b' }

function read(name: string, fallback: string): string {
  if (typeof getComputedStyle !== 'function') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

/** Citește culorile graficelor din variabilele temei active; se recalculează la schimbarea temei. */
export function useChartColors(): ChartColors {
  const theme = useTheme((s) => s.theme)
  return useMemo(
    () => ({
      s1: read('--chart-1', FALLBACK.s1),
      s2: read('--chart-2', FALLBACK.s2),
      ink: read('--chart-ink', FALLBACK.ink),
      muted: read('--chart-muted', FALLBACK.muted),
      grid: read('--chart-grid', FALLBACK.grid),
      danger: read('--chart-danger', FALLBACK.danger),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  )
}
