export interface BigNumberProps {
  value: string
  suffix?: string
  size?: 'md' | 'lg' | 'xl'
  muted?: boolean
}

const sizes = { md: 'text-3xl', lg: 'text-5xl', xl: 'text-7xl' } as const

/** Cifră mare, tabulară, cu sufix mic. Tema C trăiește din aceste numere. */
export function BigNumber({ value, suffix, size = 'lg', muted = false }: BigNumberProps) {
  return (
    <span className={`num font-display inline-flex items-baseline gap-1 font-black leading-none tracking-tighter ${sizes[size]} ${muted ? 'opacity-50' : ''}`}>
      {value}
      {suffix && <span className="text-base font-bold tracking-normal opacity-60">{suffix}</span>}
    </span>
  )
}
