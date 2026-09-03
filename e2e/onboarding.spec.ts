import { test, expect } from '@playwright/test'
import { completeOnboarding } from './helpers'

test('onboarding-ul duce la tab-ul Azi cu cele 5 secțiuni', async ({ page }) => {
  await completeOnboarding(page)
  const nav = page.getByRole('navigation', { name: 'Secțiuni' })
  await expect(nav.getByRole('link')).toHaveText(['Azi', 'Progres', 'Mese', 'Sală', 'Rețete'])
  await nav.getByRole('link', { name: 'Sală' }).click()
  await expect(page.getByRole('heading', { name: 'Sală' })).toBeVisible()
  await expect(page).toHaveURL(/#\/sala$/)
})

test('manifestul PWA este servit și are numele corect', async ({ page, request }) => {
  await page.goto('./')
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href).toBeTruthy()
  const res = await request.get(new URL(href!, page.url()).toString())
  expect(res.ok()).toBe(true)
  const manifest = await res.json()
  expect(manifest.name).toBe('90 Day Fit')
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.length).toBeGreaterThanOrEqual(3)
})
