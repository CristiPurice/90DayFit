import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card, CardLabel } from '@/ui/Card'
import { BigNumber } from '@/ui/BigNumber'
import { ProgressBar } from '@/ui/ProgressBar'
import { Sheet } from '@/ui/Sheet'
import { NumberField } from '@/ui/NumberField'
import { Button } from '@/ui/Button'
import { formatKg } from '@/domain/format'
import { addDays } from '@/domain/plan'
import { sevenDayAverage, weeklyRate, weightProgress } from '@/domain/weight'
import { getWeight, listWeightsBetween, putWeight, WEIGHT_LIMITS } from '@/data/repo/weights'

export interface WeightCardProps {
  dateKey: string
  startKg: number
  targetKg: number
}

function signed(kg: number): string {
  const s = formatKg(Math.abs(kg))
  return kg < 0 ? `−${s}` : kg > 0 ? `+${s}` : s
}

export function WeightCard({ dateKey, startKg, targetKg }: WeightCardProps) {
  const today = useLiveQuery(() => getWeight(dateKey), [dateKey])
  const recent = useLiveQuery(() => listWeightsBetween(addDays(dateKey, -13), dateKey), [dateKey])
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const points = recent ?? []
  const avg = sevenDayAverage(points, dateKey)
  const rate = weeklyRate(points, dateKey)
  const reference = avg ?? today?.kg ?? null
  const progress = reference === null ? null : weightProgress(startKg, targetKg, reference)
  const totalToLose = formatKg(startKg - targetKg)

  async function save() {
    if (draft === null) return
    setSaving(true)
    try {
      await putWeight(dateKey, draft)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card
        onPress={() => {
          setDraft(today?.kg ?? null)
          setOpen(true)
        }}
        label="Greutate"
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <CardLabel>Greutate azi</CardLabel>
            {today ? (
              <BigNumber value={formatKg(today.kg)} suffix="kg" size="xl" />
            ) : (
              <p className="mt-1 text-2xl font-black uppercase tracking-tight text-primary">Notează greutatea</p>
            )}
          </div>
          <div className="text-right">
            <CardLabel>Țintă</CardLabel>
            <BigNumber value={formatKg(targetKg, 0)} size="md" muted />
          </div>
        </div>

        {progress && (
          <div className="mt-3 flex flex-col gap-2">
            <ProgressBar percent={progress.percent} label="Progres spre țintă" />
            <p className="num text-sm font-bold">
              {signed(-progress.lostKg)} din {totalToLose} kg
              <span className="text-card-muted"> · mai ai {formatKg(Math.max(0, progress.remainingKg))} kg</span>
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-card-muted">
          <span className="num">Media 7 zile: {avg === null ? '—' : `${formatKg(avg)} kg`}</span>
          <span className="num">Ritm: {rate === null ? '—' : `${signed(rate)} kg/săpt.`}</span>
        </div>
      </Card>

      <Sheet open={open} onClose={() => setOpen(false)} title="Greutatea de azi">
        <NumberField
          label="Greutate"
          value={draft}
          onChange={setDraft}
          suffix="kg"
          min={WEIGHT_LIMITS.min}
          max={WEIGHT_LIMITS.max}
          autoFocus
        />
        <p className="text-sm text-muted">Dimineața, după toaletă, înainte de mâncare. Contează media, nu ziua.</p>
        <Button full onClick={save} disabled={draft === null || saving}>
          {saving ? 'Se salvează…' : 'Salvează'}
        </Button>
      </Sheet>
    </>
  )
}
