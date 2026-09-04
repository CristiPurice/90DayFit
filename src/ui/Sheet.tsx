import { useEffect, useId, type ReactNode } from 'react'

export interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** Panou de introducere care urcă de jos, peste pagină. Se închide cu Escape, cu butonul sau cu tap pe fundal. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-end" role="presentation">
      <button
        type="button"
        aria-label="Închide panoul"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92dvh] flex-col gap-5 overflow-y-auto rounded-t-3xl border-t border-line bg-tab-bg px-5 pt-4 text-fg"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-xl font-black uppercase tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide text-muted"
          >
            Închide
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
