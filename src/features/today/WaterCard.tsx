import { useLiveQuery } from 'dexie-react-hooks'
import { Card, CardLabel } from '@/ui/Card'
import { BigNumber } from '@/ui/BigNumber'
import { ProgressBar } from '@/ui/ProgressBar'
import { formatLiters, waterPercent, WATER_QUICK_ADD_ML } from '@/domain/water'
import { addWaterEvent, getWater, undoLastWater } from '@/data/repo/water'

export interface WaterCardProps {
  dateKey: string
  targetMl: number
}

export function WaterCard({ dateKey, targetMl }: WaterCardProps) {
  const entry = useLiveQuery(() => getWater(dateKey), [dateKey])
  const total = entry?.totalMl ?? 0
  const percent = waterPercent(total, targetMl)
  const canUndo = (entry?.events.length ?? 0) > 0

  return (
    <Card>
      <div className="flex items-end justify-between gap-3">
        <div>
          <CardLabel>Apă</CardLabel>
          <BigNumber value={formatLiters(total)} suffix={`/ ${formatLiters(targetMl)} L`} />
        </div>
        <span className="num text-sm font-bold text-card-muted">{percent}%</span>
      </div>
      <div className="mt-3">
        <ProgressBar percent={percent} tone={percent >= 100 ? 'good' : 'bg'} label="Apă băută" />
      </div>
      <div className="mt-3 flex gap-2">
        {WATER_QUICK_ADD_ML.map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => addWaterEvent(dateKey, ml)}
            className="num flex-1 rounded-2xl bg-primary py-3 text-base font-black text-primary-fg active:scale-[0.98]"
          >
            +{ml} ml
          </button>
        ))}
        <button
          type="button"
          onClick={() => undoLastWater(dateKey)}
          disabled={!canUndo}
          className="rounded-2xl border border-line px-4 py-3 text-sm font-bold uppercase tracking-wide text-card-muted disabled:opacity-40"
        >
          Anulează
        </button>
      </div>
    </Card>
  )
}
