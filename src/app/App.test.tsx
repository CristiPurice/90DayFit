import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { db } from '@/data/db'
import { setSettings } from '@/data/repo/settings'
import { useLock } from '@/app/store/lock'
import { hashPin } from '@/domain/pin'

describe('App', () => {
  beforeEach(async () => {
    await db.settings.clear()
    window.location.hash = ''
  })

  it('arată onboarding-ul când nu există setări', async () => {
    useLock.setState({ locked: true })
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Alege un PIN' })).toBeInTheDocument()
  })

  it('arată ecranul de PIN când e configurată și blocată', async () => {
    const { hash, salt } = await hashPin('1234')
    await setSettings({ onboarded: true, pinHash: hash, pinSalt: salt })
    useLock.setState({ locked: true })
    render(<App />)
    expect(await screen.findByText('Blocat')).toBeInTheDocument()
  })

  it('arată cele 5 taburi și navighează după deblocare', async () => {
    const user = userEvent.setup()
    const { hash, salt } = await hashPin('1234')
    await setSettings({ onboarded: true, pinHash: hash, pinSalt: salt })
    useLock.setState({ locked: false })
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Azi' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Secțiuni' })
    const links = nav.querySelectorAll('a')
    expect(Array.from(links).map((a) => a.textContent)).toEqual(['Azi', 'Progres', 'Mese', 'Sală', 'Rețete'])
    await user.click(screen.getByRole('link', { name: 'Progres' }))
    expect(await screen.findByRole('heading', { name: 'Progres' })).toBeInTheDocument()
  })
})
