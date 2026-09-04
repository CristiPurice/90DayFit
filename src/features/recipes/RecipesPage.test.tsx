import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecipesPage } from './RecipesPage'
import { RECIPES, filterRecipes } from '@/domain/recipes'

describe('RecipesPage', () => {
  it('listează toate rețetele și filtrează după masă și timp', async () => {
    const user = userEvent.setup()
    render(<RecipesPage />)
    const list = screen.getByRole('list', { name: 'Rețete' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(RECIPES.length)

    await user.click(screen.getByRole('button', { name: 'Cină' }))
    expect(within(list).getAllByRole('listitem')).toHaveLength(filterRecipes(RECIPES, { slot: 'dinner' }).length)

    await user.click(screen.getByRole('button', { name: '≤ 15 min' }))
    const expected = filterRecipes(RECIPES, { slot: 'dinner', maxMinutes: 15 }).length
    expect(within(list).getAllByRole('listitem')).toHaveLength(expected)
    expect(screen.getByText(new RegExp(`^${expected} din ${RECIPES.length}`))).toBeInTheDocument()
  })

  it('deschide detaliul cu ingrediente și pași', async () => {
    const user = userEvent.setup()
    render(<RecipesPage />)
    await user.click(screen.getByRole('button', { name: 'Piept de pui la cuptor cu cartofi și legume' }))
    const dialog = screen.getByRole('dialog', { name: 'Piept de pui la cuptor cu cartofi și legume' })
    expect(within(dialog).getByText('Ingrediente')).toBeInTheDocument()
    expect(within(dialog).getByText('Piept de pui')).toBeInTheDocument()
    expect(within(dialog).getByText('220 g')).toBeInTheDocument()
    expect(within(dialog).getByText(/Cartofii felii/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Închide' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
