import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card, CardLabel } from '@/ui/Card'
import { Sheet } from '@/ui/Sheet'
import { NumberField } from '@/ui/NumberField'
import { Button } from '@/ui/Button'
import { BP_LIMITS, bpLabel, classifyBp, isValidBp, type BpLevel } from '@/domain/bp'
import { listBpForDay, putBp } from '@/data/repo/bp'
import type { BpEntry, BpSlot } from '@/data/db'

export interface BpCardProps {
  dateKey: string
}

const SLOTS: { slot: BpSlot; label: string; hint: string }[] = [
  { slot: 'am', label: 'Dimineață', hint: 'după trezire, înainte de cafea' },
  { slot: 'pm', label: 'Seară', hint: 'înainte de somn' },
]

const levelTone: Record<BpLevel, string> = {
  normal: 'bg-good text-white',
  atentie: 'bg-warn text-white',
  ridicata: 'bg-danger text-white',
  consult: 'bg-danger text-white',
}

function LevelPill({ level }: { level: BpLevel }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${levelTone[level]}`}>
      {bpLabel(level)}
    </span>
  )
}

export function BpCard({ dateKey }: BpCardProps) {
  const entries = useLiveQuery(() => listBpForDay(dateKey), [dateKey])
  const [editing, setEditing] = useState<BpSlot | null>(null)
  const [sys, setSys] = useState<number | null>(null)
  const [dia, setDia] = useState<number | null>(null)
  const [pulse, setPulse] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const bySlot: Partial<Record<BpSlot, BpEntry>> = {}
  for (const e of entries ?? []) bySlot[e.slot] = e

  function openFor(slot: BpSlot) {
    const e = bySlot[slot]
    setSys(e?.systolic ?? null)
    setDia(e?.diastolic ?? null)
    setPulse(e?.pulse ?? null)
    setEditing(slot)
  }

  const draftValid = sys !== null && dia !== null && isValidBp(sys, dia, pulse ?? undefined)
  const draftLevel = draftValid ? classifyBp(sys, dia) : null

  async function save() {
    if (!editing || sys === null || dia === null || !draftValid) return
    setSaving(true)
    try {
      const input = { date: dateKey, slot: editing, systolic: sys, diastolic: dia } as Parameters<typeof putBp>[0]
      if (pulse !== null) input.pulse = pulse
      await putBp(input)
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  const current = editing ? SLOTS.find((s) => s.slot === editing) : undefined

  return (
    <>
      <Card>
        <CardLabel>Tensiune arterială</CardLabel>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SLOTS.map(({ slot, label }) => {
            const e = bySlot[slot]
            const level = e ? classifyBp(e.systolic, e.diastolic) : null
            return (
              <button
                key={slot}
                type="button"
                onClick={() => openFor(slot)}
                aria-label={`Tensiune ${label.toLowerCase()}`}
                className={`rounded-2xl border p-3 text-left ${e ? 'border-line' : 'border-dashed border-card-muted/50'}`}
              >
                <span className="block text-[10px] font-bold uppercase tracking-widest text-card-muted">{label}</span>
                {e ? (
                  <>
                    <span className="num block text-2xl font-black tracking-tight">
                      {e.systolic}/{e.diastolic}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-xs text-card-muted">
                      {level && <LevelPill level={level} />}
                      {e.pulse !== undefined && <span className="num">{e.pulse} bpm</span>}
                    </span>
                  </>
                ) : (
                  <span className="block text-base font-black uppercase text-bg">Notează</span>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={`Tensiune · ${current?.label ?? ''}`}>
        {current && <p className="-mt-2 text-sm text-muted">Măsurată {current.hint}, așezat, după 5 minute de liniște.</p>}
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Sistolică" value={sys} onChange={setSys} digits={0} min={BP_LIMITS.systolic.min} max={BP_LIMITS.systolic.max} autoFocus />
          <NumberField label="Diastolică" value={dia} onChange={setDia} digits={0} min={BP_LIMITS.diastolic.min} max={BP_LIMITS.diastolic.max} />
        </div>
        <NumberField label="Puls (opțional)" value={pulse} onChange={setPulse} suffix="bpm" digits={0} min={BP_LIMITS.pulse.min} max={BP_LIMITS.pulse.max} />
        {draftLevel && (
          <div className="flex items-center gap-2 text-sm" role="status">
            <LevelPill level={draftLevel} />
            {draftLevel === 'consult' && (
              <span className="font-bold">Valoare foarte mare. Remăsoară după 5 minute; dacă rămâne, sună medicul.</span>
            )}
            {draftLevel === 'ridicata' && <span className="text-muted">Peste 140/90. Notează și urmărește tendința.</span>}
          </div>
        )}
        {sys !== null && dia !== null && !draftValid && (
          <p role="alert" className="text-sm font-bold text-accent">
            Sistolica trebuie să fie mai mare decât diastolica.
          </p>
        )}
        <Button full onClick={save} disabled={!draftValid || saving}>
          {saving ? 'Se salvează…' : 'Salvează'}
        </Button>
      </Sheet>
    </>
  )
}
