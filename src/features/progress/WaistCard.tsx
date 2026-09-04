import { useState } from 'react'
import { Card, CardLabel } from '@/ui/Card'
import { BigNumber } from '@/ui/BigNumber'
import { Sheet } from '@/ui/Sheet'
import { NumberField } from '@/ui/NumberField'
import { Button } from '@/ui/Button'
import { formatDate, formatKg } from '@/domain/format'
import type { WaistEntry } from '@/data/db'
import { WAIST_LIMITS, putWaist } from '@/data/repo/waist'

export interface WaistCardProps {
  entries: WaistEntry[]
  startCm: number
  todayKey: string
}

export function WaistCard({ entries, startCm, todayKey }: WaistCardProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const last = entries[entries.length - 1]
  const delta = last ? last.cm - startCm : null

  async function save() {
    if (draft === null) return
    setSaving(true)
    try {
      await putWaist(todayKey, draft)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card
        onPress={() => {
          setDraft(last?.cm ?? startCm)
          setOpen(true)
        }}
        label="Talie"
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <CardLabel>Talie · duminica, la ombilic</CardLabel>
            {last ? <BigNumber value={formatKg(last.cm)} suffix="cm" /> : <p className="mt-1 text-2xl font-black uppercase text-primary">Măsoară talia</p>}
          </div>
          <div className="text-right">
            <CardLabel>Start</CardLabel>
            <BigNumber value={formatKg(startCm, 0)} size="md" muted />
          </div>
        </div>
        <p className="num mt-2 text-sm text-card-muted">
          {last && delta !== null
            ? `${delta <= 0 ? '−' : '+'}${formatKg(Math.abs(delta))} cm față de start · măsurată pe ${formatDate(last.date)}`
            : 'Relaxat, după expirație, 3 măsurători, notezi media.'}
        </p>
      </Card>
      <Sheet open={open} onClose={() => setOpen(false)} title="Talia de azi">
        <NumberField label="Talie" value={draft} onChange={setDraft} suffix="cm" min={WAIST_LIMITS.min} max={WAIST_LIMITS.max} autoFocus />
        <Button full onClick={save} disabled={draft === null || saving}>
          {saving ? 'Se salvează…' : 'Salvează'}
        </Button>
      </Sheet>
    </>
  )
}
