import { useRegisterSW } from 'virtual:pwa-register/react'

/** Banner discret când service worker-ul a descărcat o versiune nouă. */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      className="fixed inset-x-3 z-20 flex items-center justify-between gap-3 rounded-2xl bg-accent px-4 py-3 text-accent-fg shadow-lg"
      style={{ bottom: 'calc(84px + env(safe-area-inset-bottom))' }}
    >
      <span className="text-sm font-bold">Versiune nouă disponibilă</span>
      <div className="flex gap-2">
        <button type="button" className="text-sm font-bold underline" onClick={() => setNeedRefresh(false)}>
          Mai târziu
        </button>
        <button
          type="button"
          className="rounded-xl bg-card-fg px-3 py-1 text-sm font-black text-fg"
          onClick={() => updateServiceWorker(true)}
        >
          Reîncarcă
        </button>
      </div>
    </div>
  )
}
