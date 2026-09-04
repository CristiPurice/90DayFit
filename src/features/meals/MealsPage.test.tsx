import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { db } from '@/data/db'
import { getMealsForDay } from '@/data/repo/meals'
import { MealsPage } from './MealsPage'
import { MealsCard } from '@/features/today/MealsCard'

const D = '2026-09-30'

beforeEach(async () => {
  await db.meals.clear()
})

describe('MealsPage', () => {
  it('pornește cu variantele de bază și totalul planului', async () => {
    render(<MealsPage dateKey={D} />)
    expect(await screen.findByText('2.420')).toBeInTheDocument()
    expect(screen.getByTestId('adherence')).toHaveTextContent('0 din 3 mese conform planului')
    expect(screen.getByText('Ovăz, iaurt, ouă, banană')).toBeInTheDocument()
    expect(screen.getByText('Pui la grătar, orez, salată')).toBeInTheDocument()
    expect(screen.getByText('Pui, cartofi la cuptor, legume')).toBeInTheDocument()
  })

  it('alegerea unei alternative recalculează totalul', async () => {
    const user = userEvent.setup()
    render(<MealsPage dateKey={D} />)
    await screen.findByText('2.420')
    const buttons = screen.getAllByRole('button', { name: 'Alternative' })
    await user.click(buttons[1]!)
    const group = screen.getByRole('radiogroup', { name: 'Variante pentru prânz' })
    expect(within(group).getByRole('radio', { name: /Pui la grătar/ })).toHaveAttribute('aria-checked', 'true')
    await user.click(within(group).getByRole('radio', { name: /Salată cu pui, iaurt și pâine/ }))
    expect(await screen.findByText('2.330')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Salată cu pui, iaurt și pâine' })).toBeInTheDocument()
    expect((await getMealsForDay(D))[0]?.optionId).toBe('alt2')
  })

  it('bifarea meselor actualizează aderența', async () => {
    const user = userEvent.setup()
    render(<MealsPage dateKey={D} />)
    await screen.findByText('2.420')
    await user.click(screen.getByRole('switch', { name: 'Mic dejun: conform planului' }))
    await user.click(screen.getByRole('switch', { name: 'Cină: conform planului' }))
    await vi.waitFor(() => expect(screen.getByTestId('adherence')).toHaveTextContent('2 din 3'))
    expect(screen.getByRole('switch', { name: 'Mic dejun: conform planului' })).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('switch', { name: 'Mic dejun: conform planului' }))
    await vi.waitFor(() => expect(screen.getByTestId('adherence')).toHaveTextContent('1 din 3'))
  })
})

describe('MealsCard (Azi)', () => {
  it('rezumă cele 3 mese și aderența', async () => {
    render(
      <MemoryRouter>
        <MealsCard dateKey={D} />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/Mesele de azi · 2\.420 kcal/)).toBeInTheDocument()
    expect(screen.getByText('0 din 3 conform planului')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Vezi mesele' })).toHaveAttribute('href', '/mese')
  })
})
