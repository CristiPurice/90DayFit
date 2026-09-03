import type { ReactNode } from 'react'

export interface PageProps {
  title: string
  eyebrow?: string
  children?: ReactNode
}

/** Container standard pentru un tab: titlu mare, spațiu pentru bara de taburi. */
export function Page({ title, eyebrow, children }: PageProps) {
  return (
    <main className="min-h-dvh px-4 pt-[max(16px,env(safe-area-inset-top))] pb-28">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-muted">{eyebrow}</p>}
      <h1 className="text-3xl font-black uppercase tracking-tight">{title}</h1>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </main>
  )
}
