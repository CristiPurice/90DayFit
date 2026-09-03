export interface AppRoute {
  path: string
  label: string
}

export const ROUTES: readonly AppRoute[] = [
  { path: '/azi', label: 'Azi' },
  { path: '/progres', label: 'Progres' },
  { path: '/mese', label: 'Mese' },
  { path: '/sala', label: 'Sală' },
  { path: '/retete', label: 'Rețete' },
] as const

export const DEFAULT_ROUTE = '/azi'
