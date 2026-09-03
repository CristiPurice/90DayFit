import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LockScreen } from './LockScreen'
import { hashPin } from '@/domain/pin'
import { useLock } from '@/app/store/lock'

async function typePin(user: ReturnType<typeof userEvent.setup>, pin: string) {
  for (const k of pin) await user.click(screen.getByRole('button', { name: k }))
  await user.click(screen.getByRole('button', { name: 'Confirmă' }))
}

describe('LockScreen', () => {
  let hash = ''
  let salt = ''
  beforeAll(async () => {
    const r = await hashPin('1234')
    hash = r.hash
    salt = r.salt
  })
  beforeEach(() => {
    useLock.setState({ locked: true, failedAttempts: 0 })
  })

  it('arată „PIN greșit” și rămâne blocat la PIN incorect', async () => {
    const user = userEvent.setup()
    render(<LockScreen pinHash={hash} pinSalt={salt} />)
    await typePin(user, '9999')
    expect(await screen.findByText('PIN greșit')).toBeInTheDocument()
    expect(useLock.getState().locked).toBe(true)
    expect(useLock.getState().failedAttempts).toBe(1)
  })

  it('deblochează la PIN corect', async () => {
    const user = userEvent.setup()
    render(<LockScreen pinHash={hash} pinSalt={salt} />)
    await typePin(user, '1234')
    await vi.waitFor(() => expect(useLock.getState().locked).toBe(false))
  })
})
