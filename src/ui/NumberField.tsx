import { useId, useState } from 'react'
import { parseDecimal, formatKg } from '@/domain/format'

export interface NumberFieldProps {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  suffix?: string
  min?: number
  max?: number
  digits?: number
  autoFocus?: boolean
}

function toText(value: number | null, digits: number): string {
  return value === null ? '' : formatKg(value, digits)
}

/** Câmp numeric cu tastatură zecimală, acceptă virgulă sau punct. Validează intervalul. */
export function NumberField({ label, value, onChange, suffix, min, max, digits = 1, autoFocus }: NumberFieldProps) {
  const id = useId()
  const [text, setText] = useState(() => toText(value, digits))
  const [error, setError] = useState<string | null>(null)

  function handle(raw: string) {
    setText(raw)
    if (raw.trim() === '') {
      setError(null)
      onChange(null)
      return
    }
    const n = parseDecimal(raw)
    if (n === null) {
      setError('Introdu un număr, de exemplu 124,8')
      onChange(null)
      return
    }
    if (min !== undefined && n < min) {
      setError(`Minim ${formatKg(min, digits)}`)
      onChange(null)
      return
    }
    if (max !== undefined && n > max) {
      setError(`Maxim ${formatKg(max, digits)}`)
      onChange(null)
      return
    }
    setError(null)
    onChange(n)
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted">
        {label}
      </label>
      <div className="flex items-baseline gap-2 rounded-2xl bg-card px-4 py-3 text-card-fg">
        <input
          id={id}
          inputMode="decimal"
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => handle(e.target.value)}
          aria-invalid={error !== null}
          aria-describedby={error ? `${id}-err` : undefined}
          className="num w-full bg-transparent text-4xl font-black outline-none"
        />
        {suffix && <span className="text-lg font-bold text-card-muted">{suffix}</span>}
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="text-sm font-semibold text-accent">
          {error}
        </p>
      )}
    </div>
  )
}
