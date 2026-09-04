import { test, expect } from '@playwright/test'
import { completeOnboarding, typePin } from './helpers'

test('mese: alternativă, aderență, rezumat pe Azi și rețete, persistente', async ({ page }) => {
  await completeOnboarding(page, '1234')

  // Rezumatul pe Azi
  await expect(page.getByText(/Mesele de azi · 2\.420 kcal/)).toBeVisible()
  await page.getByRole('link', { name: 'Vezi mesele' }).click()
  await expect(page.getByRole('heading', { name: 'Mese' })).toBeVisible()
  await expect(page.getByTestId('adherence')).toHaveText('0 din 3 mese conform planului')

  // Alternativă la prânz
  await page.getByRole('button', { name: 'Alternative' }).nth(1).click()
  await page.getByRole('radio', { name: /Pui rotisat cu salată de varză/ }).click()
  await expect(page.getByText(/^2\.380/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pui rotisat cu salată de varză' })).toBeVisible()

  // Bifează micul dejun și cina
  await page.getByRole('switch', { name: 'Mic dejun: conform planului' }).click()
  await page.getByRole('switch', { name: 'Cină: conform planului' }).click()
  await expect(page.getByTestId('adherence')).toHaveText('2 din 3 mese conform planului')

  // Rețete
  await page.getByRole('link', { name: 'Rețete' }).click()
  await expect(page.getByRole('heading', { name: 'Rețete' })).toBeVisible()
  await page.getByRole('button', { name: 'Cină', exact: true }).click()
  await page.getByRole('button', { name: '≤ 15 min' }).click()
  await page.getByRole('button', { name: 'Omletă de cină cu brânză de vaci și salată' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Ingrediente')
  await expect(dialog).toContainText('Brânză de vaci')
  await dialog.getByRole('button', { name: 'Închide' }).click()

  // Persistență
  await page.reload()
  await typePin(page, '1234')
  await page.getByRole('link', { name: 'Mese' }).click()
  await expect(page.getByText(/^2\.380/)).toBeVisible()
  await expect(page.getByTestId('adherence')).toHaveText('2 din 3 mese conform planului')
  await expect(page.getByRole('switch', { name: 'Mic dejun: conform planului' })).toHaveAttribute('aria-checked', 'true')
})
