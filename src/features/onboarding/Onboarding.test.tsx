import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding } from './Onboarding'
import { db } from '@/data/db'
import { getAllSettings } from '@/data/repo/settings'
import { useLock } from '@/app/store/lock'
import { verifyPin } from '@/domain/pin'

async function typePin(user: ReturnType<typeof userEvent.setup>, pin: string) {
  for (const k of pin) await user.click(screen.getByRole('button', { name: k }))
  await user.click(screen.getByRole('button', { name: 'Confirmă' }))
}

describe('Onboarding', () => {
  beforeEach(async () => {
    await db.settings.clear()
    useLock.setState({ locked: true, failedAttempts: 0 })
  })

  it('parcurge cei 5 pași și salvează setările', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    render(<Onboarding onDone={onDone} />)

    expect(screen.getByRole('heading', { name: 'Alege un PIN' })).toBeInTheDocument()
    await typePin(user, '1234')
    expect(screen.getByRole('heading', { name: 'Repetă PIN-ul' })).toBeInTheDocument()
    await typePin(user, '1234')

    expect(screen.getByRole('heading', { name: 'Greutatea de start' })).toBeInTheDocument()
    expect(screen.getByLabelText('Greutate')).toHaveValue('130,0')
    await user.click(screen.getByRole('button', { name: 'Continuă' }))

    expect(screen.getByLabelText('Țintă')).toHaveValue('115,0')
    await user.click(screen.getByRole('button', { name: 'Continuă' }))

    expect(screen.getByLabelText('Prima zi a planului')).toHaveValue('2026-09-07')
    await user.click(screen.getByRole('button', { name: 'Începe' }))

    await vi.waitFor(() => expect(onDone).toHaveBeenCalled())
    const s = await getAllSettings()
    expect(s.onboarded).toBe(true)
    expect(s.startKg).toBe(130)
    expect(s.targetKg).toBe(115)
    expect(s.startDate).toBe('2026-09-07')
    expect(s.theme).toBe('coach')
    expect(await verifyPin('1234', s.pinHash!, s.pinSalt!)).toBe(true)
    expect(useLock.getState().locked).toBe(false)
  })

  it('cere din nou PIN-ul dacă confirmarea nu coincide', async () => {
    const user = userEvent.setup()
    render(<Onboarding onDone={() => {}} />)
    await typePin(user, '1234')
    await typePin(user, '4321')
    expect(screen.getByRole('status')).toHaveTextContent('nu coincid')
    expect(screen.getByRole('heading', { name: 'Repetă PIN-ul' })).toBeInTheDocument()
  })
})
