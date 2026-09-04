import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { SettingsPage } from './SettingsPage'
import { clearAllData } from '@/data/backup'
import { putWeight, getWeight } from '@/data/repo/weights'
import { setSetting, getSetting } from '@/data/repo/settings'

function renderPage(onDeleted?: () => void) {
  return render(
    <MemoryRouter>
      <SettingsPage onDeleted={onDeleted} />
    </MemoryRouter>,
  )
}

beforeEach(async () => {
  await clearAllData()
})

describe('SettingsPage', () => {
  it('exportă prin partajare când e disponibilă', async () => {
    const user = userEvent.setup()
    await putWeight('2026-09-07', 130)
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { share, canShare: () => true })
    try {
      renderPage()
      await user.click(screen.getByRole('button', { name: 'Exportă backup' }))
      expect(await screen.findByRole('status')).toHaveTextContent(/Backup pregătit: 90dayfit-backup-\d{4}-\d{2}-\d{2}\.json/)
      const file = (share.mock.calls[0]?.[0] as { files: File[] }).files[0]!
      const parsed = JSON.parse(await file.text())
      expect(parsed.app).toBe('90dayfit')
      expect(parsed.tables.weights).toEqual([{ date: '2026-09-07', kg: 130 }])
    } finally {
      Object.assign(navigator, { share: undefined, canShare: undefined })
    }
  })

  it('importă un backup valid după confirmare', async () => {
    const user = userEvent.setup()
    await putWeight('2026-09-01', 131)
    renderPage()
    const backup = {
      app: '90dayfit',
      schema: 1,
      exportedAt: 'x',
      tables: { weights: [{ date: '2026-09-07', kg: 129.4 }], settings: [{ key: 'targetKg', value: 112 }] },
    }
    const file = new File([JSON.stringify(backup)], 'b.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText('Fișier de backup'), file)
    const dialog = await screen.findByRole('dialog', { name: 'Înlocuiește datele?' })
    expect(dialog).toHaveTextContent('1 greutăți')
    await user.click(within(dialog).getByRole('button', { name: 'Da, înlocuiește' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Import reușit')
    expect(await getWeight('2026-09-01')).toBeUndefined()
    expect((await getWeight('2026-09-07'))?.kg).toBe(129.4)
    expect(await getSetting('targetKg')).toBe(112)
  })

  it('respinge un fișier străin fără să atingă datele', async () => {
    const user = userEvent.setup()
    await putWeight('2026-09-01', 131)
    renderPage()
    const file = new File(['{"app":"altceva"}'], 'x.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText('Fișier de backup'), file)
    expect(await screen.findByRole('alert')).toHaveTextContent('nu este un backup 90 Day Fit')
    expect((await getWeight('2026-09-01'))?.kg).toBe(131)
  })

  it('șterge tot după dubla confirmare', async () => {
    const user = userEvent.setup()
    await putWeight('2026-09-01', 131)
    await setSetting('onboarded', true)
    const onDeleted = vi.fn()
    renderPage(onDeleted)
    await user.click(screen.getByRole('button', { name: 'Șterge toate datele' }))
    const dialog = await screen.findByRole('dialog', { name: 'Sigur ștergi tot?' })
    await user.click(within(dialog).getByRole('button', { name: 'Da, șterge tot' }))
    await vi.waitFor(() => expect(onDeleted).toHaveBeenCalled())
    expect(await getWeight('2026-09-01')).toBeUndefined()
    expect(await getSetting('onboarded')).toBeUndefined()
  })
})
