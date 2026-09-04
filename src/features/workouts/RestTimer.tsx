import { formatSeconds } from '@/domain/workouts'
import type { RestTimer as RestTimerState } from './useRestTimer'

export function RestTimer({ timer }: { timer: RestTimerState }) {
  if (!timer.running && timer.remaining === 0) return null
  const percent = timer.total > 0 ? Math.round((timer.remaining / timer.total) * 100) : 0
  return (
    <div
      role="timer"
      aria-label="Pauză între seturi"
      className="fixed inset-x-3 z-20 flex items-center gap-3 rounded-2xl bg-accent px-4 py-3 text-accent-fg shadow-lg"
      style={{ bottom: 'calc(84px + env(safe-area-inset-bottom))' }}
    >
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Pauză</p>
        <p className="num text-3xl font-black leading-none">{formatSeconds(timer.remaining)}</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-accent-fg/20">
          <div className="h-full bg-accent-fg" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <button type="button" onClick={() => timer.add(30)} className="rounded-xl bg-accent-fg/10 px-3 py-2 text-sm font-black">
        +30 s
      </button>
      <button type="button" onClick={timer.skip} className="rounded-xl bg-accent-fg px-3 py-2 text-sm font-black text-fg">
        Sari
      </button>
    </div>
  )
}
