import { Page } from '@/ui/Page'
import { formatDate, todayKey } from '@/domain/format'
import { dayNumber, weekNumber } from '@/domain/plan'

export function TodayPage() {
  const key = todayKey()
  const day = dayNumber(key)
  const week = weekNumber(key)
  const eyebrow = day >= 1 ? `Ziua ${day} din 90 · Săptămâna ${week}` : `Start pe 07.09.2026 · azi ${formatDate(key)}`
  return (
    <Page title="Azi" eyebrow={eyebrow}>
      <p className="text-muted">Cardurile zilei se construiesc în faza 1.</p>
    </Page>
  )
}
