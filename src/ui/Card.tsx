import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  /** Dacă e setat, cardul întreg devine buton (deschide un sheet). */
  onPress?: () => void
  /** Nume accesibil: pentru buton devine aria-label, pentru secțiune la fel. */
  label?: string
  className?: string
}

const base = 'block w-full rounded-3xl bg-card p-4 text-left text-card-fg'

export function Card({ children, onPress, label, className = '' }: CardProps) {
  if (onPress) {
    return (
      <button type="button" onClick={onPress} aria-label={label} className={`${base} active:scale-[0.99] ${className}`}>
        {children}
      </button>
    )
  }
  return (
    <section aria-label={label} className={`${base} ${className}`}>
      {children}
    </section>
  )
}

export function CardLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest text-card-muted">{children}</p>
}
