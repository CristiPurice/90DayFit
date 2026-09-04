import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Page } from '@/ui/Page'
import { Card, CardLabel } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Sheet } from '@/ui/Sheet'
import { todayKey } from '@/domain/format'
import { BackupError, backupFileName, clearAllData, exportBackup, importBackup, validateBackup } from '@/data/backup'
import { THEMES } from '@/themes/themes'
import { useTheme } from '@/app/store/theme'

export interface SettingsPageProps {
  /** După ștergerea completă. Implicit: reîncarcă aplicația, care revine la onboarding. */
  onDeleted?: () => void
}

type Notice = { tone: 'ok' | 'err'; text: string } | null

function defaultOnDeleted() {
  window.location.hash = ''
  window.location.reload()
}

/** Trimite fișierul prin panoul de partajare iOS dacă există, altfel îl descarcă. */
async function deliverFile(file: File): Promise<'share' | 'download'> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], title: file.name })
    return 'share'
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'download'
}

export function SettingsPage({ onDeleted = defaultOnDeleted }: SettingsPageProps) {
  const [notice, setNotice] = useState<Notice>(null)
  const [pending, setPending] = useState<unknown>(null)
  const [pendingSummary, setPendingSummary] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const theme = useTheme((s) => s.theme)
  const chooseTheme = useTheme((s) => s.choose)

  async function doExport() {
    setBusy(true)
    setNotice(null)
    try {
      const backup = await exportBackup()
      const name = backupFileName(todayKey())
      const file = new File([JSON.stringify(backup, null, 2)], name, { type: 'application/json' })
      const how = await deliverFile(file)
      setNotice({ tone: 'ok', text: how === 'share' ? `Backup pregătit: ${name}` : `Backup descărcat: ${name}` })
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return
      setNotice({ tone: 'err', text: 'Exportul nu a reușit. Încearcă din nou.' })
    } finally {
      setBusy(false)
    }
  }

  async function onFileChosen(file: File | undefined) {
    if (!file) return
    setNotice(null)
    try {
      const json: unknown = JSON.parse(await file.text())
      const backup = validateBackup(json)
      const t = backup.tables
      const count = (rows: unknown[] | undefined) => rows?.length ?? 0
      setPendingSummary(
        `${count(t.weights)} greutăți, ${count(t.water)} zile cu apă, ${count(t.steps)} zile cu pași, ${count(t.bp)} citiri de tensiune, ${count(t.settings)} setări`,
      )
      setPending(json)
    } catch (e) {
      const msg = e instanceof BackupError ? e.message : 'Fișierul nu este un JSON valid.'
      setNotice({ tone: 'err', text: msg })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function doImport() {
    if (pending === null) return
    setBusy(true)
    try {
      await importBackup(pending)
      setNotice({ tone: 'ok', text: 'Import reușit. Datele au fost înlocuite.' })
      setPending(null)
    } catch {
      setNotice({ tone: 'err', text: 'Importul a eșuat. Nicio dată nu a fost modificată.' })
    } finally {
      setBusy(false)
    }
  }

  async function doDelete() {
    setBusy(true)
    try {
      await clearAllData()
      setConfirmDelete(false)
      onDeleted()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page
      title="Setări"
      eyebrow="Datele tale"
      action={
        <Link to="/azi" className="rounded-full px-3 py-2 text-sm font-bold uppercase tracking-wide text-muted">
          Înapoi
        </Link>
      }
    >
      {notice && (
        <p
          role={notice.tone === 'err' ? 'alert' : 'status'}
          className={`rounded-2xl px-4 py-3 text-sm font-bold ${notice.tone === 'ok' ? 'bg-good text-white' : 'bg-accent text-accent-fg'}`}
        >
          {notice.text}
        </p>
      )}

      <Card label="Temă">
        <CardLabel>Temă</CardLabel>
        <p className="mt-1 text-sm text-card-muted">Se aplică instant și rămâne salvată.</p>
        <div role="radiogroup" aria-label="Temă" className="mt-3 flex flex-col gap-2">
          {THEMES.map((t) => {
            const on = t.id === theme
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => chooseTheme(t.id)}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left ${on ? 'border-primary' : 'border-line'}`}
              >
                <span aria-hidden="true" className="flex flex-none overflow-hidden rounded-xl" style={{ width: 56, height: 40, background: t.swatch[0] }}>
                  <span className="m-1.5 flex flex-1 items-end rounded-lg p-1" style={{ background: t.swatch[1] }}>
                    <span className="h-2 w-6 rounded-full" style={{ background: t.swatch[2] }} />
                  </span>
                </span>
                <span className="flex-1">
                  <span className="block text-base font-black leading-tight">{t.name}</span>
                  <span className="block text-xs text-card-muted">{t.blurb}</span>
                </span>
                {on && <span className="text-xs font-black uppercase text-primary">Activă</span>}
              </button>
            )
          })}
        </div>
      </Card>

      <Card label="Pași din Sănătate">
        <CardLabel>Pași din aplicația Sănătate</CardLabel>
        <p className="mt-1 text-sm text-card-muted">
          iPhone-ul nu lasă o aplicație web să citească pașii direct. O Comandă rapidă îi copiază, iar tu apeși „Lipește din Sănătate” în cardul Pași.
        </p>
        <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm">
          <li>Deschide aplicația <b>Comenzi rapide</b>, apasă <b>+</b>, apoi <b>Adaugă acțiune</b>.</li>
          <li>Caută <b>Găsește mostre de sănătate</b>. Setează: Tip <b>Pași</b>, filtru <b>Data de start</b> este <b>Azi</b>, ordonare oricare.</li>
          <li>Adaugă <b>Calculează statistici</b> pe rezultat, operația <b>Sumă</b>.</li>
          <li>Adaugă <b>Copiază în clipboard</b>. Numește comanda „Pașii de azi”.</li>
          <li>Opțional: în tab-ul <b>Automatizări</b>, „Oră din zi” 21:00, rulează comanda automat și fără confirmare.</li>
        </ol>
        <p className="mt-2 text-xs text-card-muted">Seara: rulezi comanda (sau rulează singură), deschizi aplicația, Pași, Lipește din Sănătate, Salvează.</p>
      </Card>

      <Card label="Memento-uri">
        <CardLabel>Memento-uri</CardLabel>
        <p className="mt-1 text-sm text-card-muted">
          Notificările programate pentru o aplicație web cer un server; până la sincronizarea în cloud, cel mai sigur e o Automatizare din Comenzi rapide, care merge și cu telefonul blocat.
        </p>
        <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm">
          <li>Comenzi rapide, tab-ul <b>Automatizări</b>, <b>+</b>, <b>Oră din zi</b>.</li>
          <li>Ora <b>07:00</b>, zilnic, <b>Rulează imediat</b>. Acțiune: <b>Afișează notificare</b> cu textul „Tensiunea de dimineață, apoi 90 Day Fit”.</li>
          <li>Repetă pentru <b>22:00</b> cu „Tensiunea de seară și pașii”, iar luni, miercuri, vineri la <b>17:30</b> cu „Sala: Ziua A/B/C”.</li>
        </ol>
      </Card>

      <Card>
        <CardLabel>Backup</CardLabel>
        <p className="mt-1 text-sm text-card-muted">
          Datele stau doar pe acest telefon. Exportă un fișier JSON în Fișiere sau iCloud Drive o dată pe săptămână.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Button variant="accent" full onClick={doExport} disabled={busy}>
            Exportă backup
          </Button>
          <Button variant="ghost" full onClick={() => fileRef.current?.click()} disabled={busy}>
            Importă backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            aria-label="Fișier de backup"
            className="hidden"
            onChange={(e) => onFileChosen(e.target.files?.[0])}
          />
        </div>
      </Card>

      <Card>
        <CardLabel>Ștergere</CardLabel>
        <p className="mt-1 text-sm text-card-muted">Șterge toate datele de pe acest telefon, inclusiv PIN-ul. Nu se poate anula.</p>
        <div className="mt-3">
          <Button variant="ghost" full onClick={() => setConfirmDelete(true)} disabled={busy} className="text-danger">
            Șterge toate datele
          </Button>
        </div>
      </Card>

      <Sheet open={pending !== null} onClose={() => setPending(null)} title="Înlocuiește datele?">
        <p className="text-sm text-muted">
          Backup-ul conține {pendingSummary}. Toate datele actuale de pe telefon vor fi înlocuite.
        </p>
        <Button full onClick={doImport} disabled={busy}>
          Da, înlocuiește
        </Button>
        <Button variant="ghost" full onClick={() => setPending(null)} className="text-muted">
          Renunță
        </Button>
      </Sheet>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Sigur ștergi tot?">
        <p className="text-sm text-muted">Greutăți, apă, pași, tensiune, setări și PIN. Fără backup, nu le mai recuperezi.</p>
        <Button full onClick={doDelete} disabled={busy} className="bg-danger text-white">
          Da, șterge tot
        </Button>
        <Button variant="ghost" full onClick={() => setConfirmDelete(false)} className="text-muted">
          Renunță
        </Button>
      </Sheet>
    </Page>
  )
}
