import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card, CardLabel } from '@/ui/Card'
import { BigNumber } from '@/ui/BigNumber'
import { ProgressBar } from '@/ui/ProgressBar'
import { Sheet } from '@/ui/Sheet'
import { NumberField } from '@/ui/NumberField'
import { Button } from '@/ui/Button'
import { formatInt } from '@/domain/format'
import { stepTargetForDate, stepsPercent, STEPS_MAX_PER_DAY } from '@/domain/steps'
import { getSteps, putSteps } from '@/data/repo/steps'

export interface StepsCardProps {
  dateKey: string
  startDate: string
}

export function StepsCard({ dateKey, startDate }: StepsCardProps) {
  const entry = useLiveQuery(() => getSteps(dateKey), [dateKey])
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const target = stepTargetForDate(dateKey, startDate)
  const count = entry?.count
  const percent = count === undefined ? 0 : stepsPercent(count, target)

  async function save() {
    if (draft === null) return
    setSaving(true)
    try {
      await putSteps(dateKey, Math.round(draft))
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card
        onPress={() => {
          setDraft(count ?? null)
          setOpen(true)
        }}
        label="Pași"
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <CardLabel>Pași</CardLabel>
            {count === undefined ? (
              <p className="mt-1 text-2xl font-black uppercase tracking-tight text-primary">Notează pașii</p>
            ) : (
              <BigNumber value={formatInt(count)} suffix={`/ ${formatInt(target)}`} />
            )}
          </div>
          <span className="num text-sm font-bold text-card-muted">{percent}%</span>
        </div>
        <div className="mt-3">
          <ProgressBar percent={percent} tone={percent >= 100 ? 'good' : 'bg'} label="Pași față de țintă" />
        </div>
      </Card>

      <Sheet open={open} onClose={() => setOpen(false)} title="Pașii de azi">
        <NumberField label="Pași" value={draft} onChange={setDraft} min={0} max={STEPS_MAX_PER_DAY} digits={0} autoFocus />
        <p className="text-sm text-muted">Cifra din aplicația Sănătate, seara. Contează media săptămânii.</p>
        <Button full onClick={save} disabled={draft === null || saving}>
          {saving ? 'Se salvează…' : 'Salvează'}
        </Button>
      </Sheet>
    </>
  )
}
