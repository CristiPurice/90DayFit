import type { ButtonHTMLAttributes } from 'react'

type Variant = 'accent' | 'primary' | 'ghost'

const styles: Record<Variant, string> = {
  accent: 'bg-accent text-accent-fg',
  primary: 'bg-card text-card-fg',
  ghost: 'bg-transparent text-fg border border-fg/30',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  full?: boolean
}

export function Button({ variant = 'accent', full = false, className = '', ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`min-h-14 rounded-2xl px-6 text-base font-black uppercase tracking-wide active:scale-[0.98] disabled:opacity-50 ${styles[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    />
  )
}
