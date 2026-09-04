import { test, expect } from '@playwright/test'
import { completeOnboarding, typePin } from './helpers'

test('sala: somn, seturi, cronometru, cardio, încheiere, persistență', async ({ page }) => {
  await completeOnboarding(page, '1234')
  await page.getByRole('link', { name: 'Deschide sala' }).click()
  await expect(page.getByRole('heading', { name: 'Sală' })).toBeVisible()

  // În zilele fără sală alegem Ziua A; altfel programul zilei e deja ales.
  const restDay = page.getByText('Zi de pași și încălzire lombară')
  if (await restDay.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Ziua A' }).click()
  }

  await expect(page.getByRole('heading', { name: 'Cât ai dormit azi-noapte?' })).toBeVisible()
  await page.getByLabel('Ore de somn').fill('6')
  await expect(page.getByRole('status')).toHaveText('Antrenament complet')
  await page.getByRole('button', { name: 'Începe antrenamentul' }).click()

  // Primul exercițiu cu greutate
  const card = page.getByRole('region').filter({ has: page.getByLabel('Kg') }).first()
  await expect(card).toBeVisible()
  await card.getByLabel('Kg').fill('40')
  await card.getByLabel('Repetări').fill('10')
  await card.getByRole('button', { name: 'Notează setul 1' }).click()
  await expect(card).toContainText('Set 1: 40,0 kg × 10')
  const timer = page.getByRole('timer', { name: 'Pauză între seturi' })
  await expect(timer).toBeVisible()
  await timer.getByRole('button', { name: 'Sari' }).click()
  await expect(timer).toBeHidden()

  // Cardio și încheiere
  await page.getByRole('button', { name: /^Făcut \d+ min$/ }).click()
  await expect(page.getByRole('region', { name: 'Cardio' })).toContainText(/Notat: \d+ min/)
  await page.getByRole('button', { name: 'Încheie antrenamentul' }).click()
  await expect(page.getByText(/1 seturi · volum 400 kg · cardio \d+ min/)).toBeVisible()

  // Persistență
  await page.reload()
  await typePin(page, '1234')
  await expect(page.getByText('Antrenament încheiat')).toBeVisible()
  await page.getByRole('link', { name: 'Azi' }).click()
  await expect(page.getByText(/Încheiat ✓ · 1 seturi/)).toBeVisible()
})
