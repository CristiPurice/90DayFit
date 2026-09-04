import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { db } from '@/data/db'
import { addSet, getWorkout, listSetsForDay } from '@/data/repo/workouts'
import { WorkoutsPage } from './WorkoutsPage'
import { WorkoutCard } from '@/features/today/WorkoutCard'

const WED = '2026-09-30' // miercuri, săptămâna 4 → Ziua B
const TUE = '2026-09-29'

beforeEach(async () => {
  await Promise.all([db.workouts.clear(), db.sets.clear(), db.settings.clear()])
})

describe('WorkoutsPage', () => {
  it('în zi fără sală arată următorul antrenament și permite alegerea unui program', async () => {
    const user = userEvent.setup()
    render(<WorkoutsPage dateKey={TUE} />)
    expect(await screen.findByText('Zi de pași și încălzire lombară')).toBeInTheDocument()
    expect(screen.getByText(/Următorul antrenament: Miercuri, Ziua B, 30\.09\.2026/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ziua A' }))
    expect(await screen.findByRole('heading', { name: 'Cât ai dormit azi-noapte?' })).toBeInTheDocument()
    expect(screen.getByText(/Ai ales Ziua A într-o zi de pași/)).toBeInTheDocument()
  })

  it('aplică regula somnului redus: un set mai puțin și fără cardio', async () => {
    const user = userEvent.setup()
    render(<WorkoutsPage dateKey={WED} />)
    await screen.findByRole('heading', { name: 'Cât ai dormit azi-noapte?' })
    await user.type(screen.getByLabelText('Ore de somn'), '4,5')
    expect(screen.getByRole('status')).toHaveTextContent('Sub 5 ore de somn')
    await user.click(screen.getByRole('button', { name: 'Începe antrenamentul' }))

    const hip = await screen.findByRole('region', { name: 'Hip thrust' })
    expect(within(hip).getByText(/^2 × 10–12 · pauză 120 s/)).toBeInTheDocument()
    expect(screen.getByText('Fără cardio azi (regula somnului)')).toBeInTheDocument()
    expect((await getWorkout(WED))?.sleepHours).toBe(4.5)
  })

  it('notează seturi, pornește cronometrul, sugerează progresia și încheie', async () => {
    const user = userEvent.setup()
    // sesiune anterioară: 3 × 12 la 80 kg → sugestie 82,5
    for (let i = 0; i < 3; i++) await addSet('2026-09-23', 'hip-thrust', 80, 12)
    render(<WorkoutsPage dateKey={WED} />)
    await screen.findByRole('heading', { name: 'Cât ai dormit azi-noapte?' })
    await user.type(screen.getByLabelText('Ore de somn'), '6')
    await user.click(screen.getByRole('button', { name: 'Începe antrenamentul' }))

    const hip = await screen.findByRole('region', { name: 'Hip thrust' })
    expect(within(hip).getByText(/^3 × 10–12/)).toBeInTheDocument()
    expect(await within(hip).findByText(/Ultima dată: 80,0 kg × 12, 12, 12/)).toBeInTheDocument()
    expect(within(hip).getByText('Sugestie 82,5 kg')).toBeInTheDocument()

    await user.type(within(hip).getByLabelText('Kg'), '82,5')
    await user.type(within(hip).getByLabelText('Repetări'), '10')
    await user.click(within(hip).getByRole('button', { name: 'Notează setul 1' }))
    expect(await within(hip).findByText('Set 1: 82,5 kg × 10')).toBeInTheDocument()
    expect(screen.getByRole('timer', { name: 'Pauză între seturi' })).toHaveTextContent('2:00')
    expect(within(hip).getByRole('button', { name: 'Notează setul 2' })).toBeInTheDocument()

    // plank cronometrat: doar secunde
    const plank = screen.getByRole('region', { name: 'Plank frontal' })
    expect(within(plank).queryByLabelText('Kg')).not.toBeInTheDocument()
    await user.type(within(plank).getByLabelText('Secunde'), '30')
    await user.click(within(plank).getByRole('button', { name: 'Notează setul 1' }))
    expect(await within(plank).findByText('Set 1: 30 s')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Făcut 15 min' }))
    await user.click(screen.getByRole('button', { name: 'Încheie antrenamentul' }))
    expect(await screen.findByText(/2 seturi · volum 825 kg · cardio 15 min/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Notează setul/ })).not.toBeInTheDocument()
    expect((await listSetsForDay(WED)).length).toBe(2)
  })

  it('ștergerea unui set funcționează', async () => {
    const user = userEvent.setup()
    render(<WorkoutsPage dateKey={WED} />)
    await screen.findByRole('heading', { name: 'Cât ai dormit azi-noapte?' })
    await user.click(screen.getByRole('button', { name: 'Începe antrenamentul' }))
    const goblet = await screen.findByRole('region', { name: 'Genuflexiuni goblet cu ganteră' })
    await user.type(within(goblet).getByLabelText('Kg'), '24')
    await user.type(within(goblet).getByLabelText('Repetări'), '12')
    await user.click(within(goblet).getByRole('button', { name: 'Notează setul 1' }))
    await within(goblet).findByText('Set 1: 24,0 kg × 12')
    await user.click(within(goblet).getByRole('button', { name: 'Șterge setul 1' }))
    await vi.waitFor(() => expect(within(goblet).queryByText(/Set 1:/)).not.toBeInTheDocument())
  })
})

describe('WorkoutCard (Azi)', () => {
  it('arată programul zilei și starea', async () => {
    render(
      <MemoryRouter>
        <WorkoutCard dateKey={WED} />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/Ziua B · Hip thrust, Genuflexiuni goblet cu ganteră/)).toBeInTheDocument()
    expect(screen.getByText('Neînceput')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Deschide sala' })).toHaveAttribute('href', '/sala')
  })

  it('în zi de pași arată următorul antrenament', async () => {
    render(
      <MemoryRouter>
        <WorkoutCard dateKey={TUE} />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Zi de pași')).toBeInTheDocument()
    expect(screen.getByText(/Următorul: Miercuri, Ziua B/)).toBeInTheDocument()
  })
})
