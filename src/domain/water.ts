export const WATER_MAX_ML_PER_DAY = 8000
export const WATER_QUICK_ADD_ML = [250, 500] as const

/** Procent din ținta zilnică, plafonat la 100. */
export function waterPercent(totalMl: number, targetMl: number): number {
  if (targetMl <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((totalMl / targetMl) * 100)))
}

/** '2,1' pentru 2100 ml; '0,5' pentru 500 ml. */
export function formatLiters(ml: number): string {
  return (ml / 1000).toFixed(1).replace('.', ',')
}

/** Cât se mai poate adăuga azi fără a depăși plafonul de siguranță. */
export function remainingAllowanceMl(totalMl: number): number {
  return Math.max(0, WATER_MAX_ML_PER_DAY - totalMl)
}
