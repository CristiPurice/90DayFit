import { expect, type Page } from '@playwright/test'

export async function typePin(page: Page, pin: string) {
  for (const k of pin) await page.getByRole('button', { name: k, exact: true }).click()
  await page.getByRole('button', { name: 'Confirmă' }).click()
}

/** Parcurge onboarding-ul cu valorile implicite și PIN-ul dat. */
export async function completeOnboarding(page: Page, pin = '1234') {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Alege un PIN' })).toBeVisible()
  await typePin(page, pin)
  await expect(page.getByRole('heading', { name: 'Repetă PIN-ul' })).toBeVisible()
  await typePin(page, pin)
  await expect(page.getByRole('heading', { name: 'Greutatea de start' })).toBeVisible()
  await page.getByRole('button', { name: 'Continuă' }).click()
  await expect(page.getByRole('heading', { name: 'Ținta la 90 de zile' })).toBeVisible()
  await page.getByRole('button', { name: 'Continuă' }).click()
  await expect(page.getByRole('heading', { name: 'Data de start' })).toBeVisible()
  await page.getByRole('button', { name: 'Începe' }).click()
  await expect(page.getByRole('heading', { name: 'Azi' })).toBeVisible()
}
