import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db } from '@/data/db'
import { getSteps } from '@/data/repo/steps'
import { StepsCard } from './StepsCard'

const D = '2026-09-30'

function stubClipboard(text: string) {
  Object.defineProperty(navigator, 'clipboard', { value: { readText: async () => text }, configurable: true })
}

beforeEach(async () => {
  await db.steps.clear()
})

describe('StepsCard · Lipește din Sănătate', () => {
  it('preia numărul din clipboard și îl salvează', async () => {
    const user = userEvent.setup()
    stubClipboard('7.120')
    render(<StepsCard dateKey={D} startDate="2026-09-07" />)
    await user.click(await screen.findByRole('button', { name: 'Pași' }))
    const dialog = screen.getByRole('dialog', { name: 'Pașii de azi' })
    await user.click(within(dialog).getByRole('button', { name: 'Lipește din Sănătate' }))
    expect(await within(dialog).findByLabelText('Pași')).toHaveValue('7120')
    await user.click(within(dialog).getByRole('button', { name: 'Salvează' }))
    expect(await screen.findByText('7.120')).toBeInTheDocument()
    expect((await getSteps(D))?.count).toBe(7120)
  })

  it('explică dacă în clipboard nu e un număr', async () => {
    const user = userEvent.setup()
    stubClipboard('salut')
    render(<StepsCard dateKey={D} startDate="2026-09-07" />)
    await user.click(await screen.findByRole('button', { name: 'Pași' }))
    const dialog = screen.getByRole('dialog', { name: 'Pașii de azi' })
    await user.click(within(dialog).getByRole('button', { name: 'Lipește din Sănătate' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('nu este un număr de pași')
  })
})
