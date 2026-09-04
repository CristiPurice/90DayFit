import { useState } from 'react'
import { PinPad } from '@/ui/PinPad'
import { NumberField } from '@/ui/NumberField'
import { Button } from '@/ui/Button'
import { hashPin } from '@/domain/pin'
import { PLAN } from '@/domain/plan'
import { setSettings } from '@/data/repo/settings'
import { useLock } from '@/app/store/lock'

export interface OnboardingProps {
  onDone: () => void
}

type Step = 'pin' | 'pin-confirm' | 'start' | 'target' | 'date'

const ORDER: Step[] = ['pin', 'pin-confirm', 'start', 'target', 'date']

export function Onboarding({ onDone }: OnboardingProps) {
  const [step, setStep] = useState<Step>('pin')
  const [pin, setPin] = useState('')
  const [pinDraft, setPinDraft] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [startKg, setStartKg] = useState<number | null>(PLAN.startKg)
  const [targetKg, setTargetKg] = useState<number | null>(PLAN.targetKg)
  const [startDate, setStartDate] = useState<string>(PLAN.startDate)
  const [saving, setSaving] = useState(false)
  const unlock = useLock((s) => s.unlock)

  const index = ORDER.indexOf(step)

  async function finish() {
    if (startKg === null || targetKg === null || !startDate) return
    setSaving(true)
    const { hash, salt } = await hashPin(pin)
    await setSettings({
      pinHash: hash,
      pinSalt: salt,
      startKg,
      targetKg,
      startDate,
      waistStartCm: PLAN.waistStartCm,
      calorieTarget: PLAN.calorieTarget,
      theme: 'coach',
      lockTimeoutMin: 5,
      onboarded: true,
    })
    unlock()
    onDone()
  }

  return (
    <main className="flex min-h-dvh flex-col gap-8 px-6 pt-[max(24px,env(safe-area-inset-top))] pb-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted">
          Pasul {index + 1} din {ORDER.length}
        </p>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">
          {step === 'pin' && 'Alege un PIN'}
          {step === 'pin-confirm' && 'Repetă PIN-ul'}
          {step === 'start' && 'Greutatea de start'}
          {step === 'target' && 'Ținta la 90 de zile'}
          {step === 'date' && 'Data de start'}
        </h1>
      </div>

      {step === 'pin' && (
        <>
          <p className="text-muted">Între 4 și 6 cifre. Îl folosești la fiecare deschidere.</p>
          <PinPad
            value={pinDraft}
            onChange={setPinDraft}
            onSubmit={() => {
              setPin(pinDraft)
              setPinDraft('')
              setStep('pin-confirm')
            }}
          />
        </>
      )}

      {step === 'pin-confirm' && (
        <>
          <PinPad
            value={pinDraft}
            onChange={(v) => {
              setPinDraft(v)
              setPinError(null)
            }}
            onSubmit={() => {
              if (pinDraft === pin) {
                setPinDraft('')
                setStep('start')
              } else {
                setPinDraft('')
                setPinError('PIN-urile nu coincid. Încearcă din nou.')
              }
            }}
          />
          <p role="status" className="min-h-6 text-sm font-bold text-accent">
            {pinError}
          </p>
        </>
      )}

      {step === 'start' && (
        <>
          <NumberField label="Greutate" value={startKg} onChange={setStartKg} suffix="kg" min={40} max={300} autoFocus />
          <Button full disabled={startKg === null} onClick={() => setStep('target')}>
            Continuă
          </Button>
        </>
      )}

      {step === 'target' && (
        <>
          <NumberField label="Țintă" value={targetKg} onChange={setTargetKg} suffix="kg" min={40} max={300} autoFocus />
          <Button full disabled={targetKg === null} onClick={() => setStep('date')}>
            Continuă
          </Button>
        </>
      )}

      {step === 'date' && (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor="start-date" className="text-xs font-bold uppercase tracking-widest text-muted">
              Prima zi a planului
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="num rounded-2xl bg-card px-4 py-3 text-2xl font-black text-card-fg outline-none"
            />
          </div>
          <Button full disabled={!startDate || saving} onClick={finish}>
            {saving ? 'Se salvează…' : 'Începe'}
          </Button>
        </>
      )}
    </main>
  )
}
