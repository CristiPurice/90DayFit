import { useState } from 'react'
import { Card, CardLabel } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Sheet } from '@/ui/Sheet'
import { formatDate } from '@/domain/format'
import type { WeekMetrics } from '@/domain/progress'
import { REVIEW_QUESTIONS, prefillAnswers, weeklyDecision, type Severity } from '@/domain/review'
import type { ReviewEntry } from '@/data/db'
import { putReview } from '@/data/repo/reviews'

export interface ReviewCardProps {
  metrics: WeekMetrics
  prevMetrics?: WeekMetrics
  existing?: ReviewEntry
  todayKey: string
}

const tone: Record<Severity, string> = {
  ok: 'bg-good text-white',
  adjust: 'bg-warn text-white',
  alert: 'bg-danger text-white',
}

export function ReviewCard({ metrics, prevMetrics, existing, todayKey }: ReviewCardProps) {
  const [open, setOpen] = useState(false)
  const [answers, setAnswers] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const decision = weeklyDecision(metrics, prevMetrics)

  function begin() {
    setAnswers(existing?.answers.length === REVIEW_QUESTIONS.length ? existing.answers : prefillAnswers(metrics))
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    try {
      await putReview({ weekNo: metrics.weekNo, date: todayKey, answers, decision: decision.decision })
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card label="Evaluarea săptămânii">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardLabel>
              Evaluarea săptămânii {metrics.weekNo} · {formatDate(metrics.from)} – {formatDate(metrics.to)}
            </CardLabel>
            <p className="mt-1 text-xl font-black leading-tight tracking-tight" data-testid="decision">
              {decision.decision}
            </p>
          </div>
          <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${tone[decision.severity]}`}>
            {decision.severity === 'ok' ? 'În regulă' : decision.severity === 'adjust' ? 'Ajustare' : 'Atenție'}
          </span>
        </div>
        <p className="mt-1 text-sm text-card-muted">{decision.reason}</p>
        <p className="mt-2 text-xs text-card-muted">
          O singură schimbare pe săptămână. Dacă totul merge, schimbarea este „nimic”.
        </p>
        <div className="mt-3">
          <Button variant="primary" full onClick={begin} className="bg-bg text-fg">
            {existing ? 'Vezi sau modifică evaluarea' : 'Fă evaluarea de duminică'}
          </Button>
        </div>
        {existing && <p className="mt-2 text-xs font-bold text-good">Evaluare salvată pe {formatDate(existing.date)}.</p>}
      </Card>

      <Sheet open={open} onClose={() => setOpen(false)} title={`Evaluare · săptămâna ${metrics.weekNo}`}>
        <ol className="flex flex-col gap-4">
          {REVIEW_QUESTIONS.map((q, i) => (
            <li key={q} className="flex flex-col gap-1">
              <label htmlFor={`q-${i}`} className="text-sm font-bold">
                {i + 1}. {q}
              </label>
              <textarea
                id={`q-${i}`}
                value={answers[i] ?? ''}
                onChange={(e) => setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))}
                rows={2}
                className="rounded-2xl bg-card px-3 py-2 text-sm text-card-fg outline-none"
              />
            </li>
          ))}
        </ol>
        <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${tone[decision.severity]}`}>
          Decizia săptămânii: {decision.decision}
        </div>
        <Button full onClick={save} disabled={saving}>
          {saving ? 'Se salvează…' : 'Salvează evaluarea'}
        </Button>
      </Sheet>
    </>
  )
}
