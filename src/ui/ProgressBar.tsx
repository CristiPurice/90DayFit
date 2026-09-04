export interface ProgressBarProps {
  percent: number
  tone?: 'bg' | 'accent' | 'good' | 'warn' | 'danger'
  label?: string
}

const tones = {
  bg: 'bg-bg',
  accent: 'bg-accent',
  good: 'bg-good',
  warn: 'bg-warn',
  danger: 'bg-danger',
} as const

/** Bară de progres pe card alb. Pista e linia deschisă a cardului. */
export function ProgressBar({ percent, tone = 'bg', label }: ProgressBarProps) {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div
      role="progressbar"
      aria-valuenow={p}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-line"
    >
      <div className={`h-full rounded-full ${tones[tone]}`} style={{ width: `${p}%` }} />
    </div>
  )
}
