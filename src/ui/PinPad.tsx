export interface PinPadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  maxLength?: number
  minLength?: number
  disabled?: boolean
  label?: string
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

/** Tastatură numerică pentru PIN, cu indicator de cifre introduse. */
export function PinPad({
  value,
  onChange,
  onSubmit,
  maxLength = 6,
  minLength = 4,
  disabled = false,
  label = 'PIN',
}: PinPadProps) {
  const canSubmit = value.length >= minLength && !disabled

  function press(d: string) {
    if (disabled || value.length >= maxLength) return
    onChange(value + d)
  }

  const keyClass =
    'h-16 rounded-2xl bg-card/15 text-3xl font-black text-fg active:bg-card/30 disabled:opacity-40'

  return (
    <div className="flex flex-col items-center gap-6" aria-label={label}>
      <div className="flex gap-3" aria-live="polite" aria-label={`${value.length} cifre introduse`}>
        {Array.from({ length: maxLength }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 border-fg ${i < value.length ? 'bg-fg' : 'bg-transparent'}`}
          />
        ))}
      </div>
      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {KEYS.map((k) => (
          <button key={k} type="button" className={keyClass} onClick={() => press(k)} disabled={disabled}>
            {k}
          </button>
        ))}
        <button
          type="button"
          className={keyClass}
          onClick={() => onChange(value.slice(0, -1))}
          disabled={disabled || value.length === 0}
          aria-label="Șterge"
        >
          ⌫
        </button>
        <button type="button" className={keyClass} onClick={() => press('0')} disabled={disabled}>
          0
        </button>
        <button
          type="button"
          className={`${keyClass} bg-accent text-accent-fg`}
          onClick={onSubmit}
          disabled={!canSubmit}
          aria-label="Confirmă"
        >
          OK
        </button>
      </div>
    </div>
  )
}
