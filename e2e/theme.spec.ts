import { test, expect } from '@playwright/test'
import { completeOnboarding, typePin } from './helpers'

test('tema se schimbă instant și persistă după reîncărcare', async ({ page }) => {
  await completeOnboarding(page, '1234')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'coach')

  await page.getByRole('link', { name: 'Setări' }).click()
  const group = page.getByRole('radiogroup', { name: 'Temă' })
  await expect(group.getByRole('radio', { name: /Antrenorul/ })).toHaveAttribute('aria-checked', 'true')
  await group.getByRole('radio', { name: /Tura de noapte/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
  const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)
  expect(bg).toBe('rgb(16, 17, 20)')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
  await typePin(page, '1234')
  await expect(page.getByRole('heading', { name: 'Setări' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')

  await page.getByRole('radiogroup', { name: 'Temă' }).getByRole('radio', { name: /Clinic/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'clinic')
})
