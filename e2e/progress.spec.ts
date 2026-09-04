import { test, expect } from '@playwright/test'
import { completeOnboarding, typePin } from './helpers'

test('progres: talie, grafice, evaluarea de duminică, persistență', async ({ page }) => {
  await completeOnboarding(page, '1234')

  // Ceva date pe Azi ca să existe conținut
  await page.getByRole('button', { name: 'Greutate' }).click()
  await page.getByRole('dialog').getByLabel('Greutate').fill('129,4')
  await page.getByRole('dialog').getByRole('button', { name: 'Salvează' }).click()
  await page.getByRole('button', { name: 'Tensiune dimineață' }).click()
  await page.getByRole('dialog').getByLabel('Sistolică').fill('126')
  await page.getByRole('dialog').getByLabel('Diastolică').fill('78')
  await page.getByRole('dialog').getByRole('button', { name: 'Salvează' }).click()

  await page.getByRole('link', { name: 'Progres' }).click()
  await expect(page.getByRole('heading', { name: 'Progres' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Greutate' })).toContainText('129,4')
  await expect(page.getByRole('region', { name: 'Tensiune' })).toContainText('ultimele 1 citiri')

  // Talie
  await page.getByRole('button', { name: 'Talie' }).click()
  const waist = page.getByRole('dialog', { name: 'Talia de azi' })
  await waist.getByLabel('Talie').fill('114')
  await waist.getByRole('button', { name: 'Salvează' }).click()
  await expect(page.getByRole('button', { name: 'Talie' })).toContainText('114,0')
  await expect(page.getByRole('button', { name: 'Talie' })).toContainText('−1,0 cm față de start')

  // Evaluarea
  await page.getByRole('button', { name: 'Fă evaluarea de duminică' }).click()
  const sheet = page.getByRole('dialog', { name: /Evaluare · săptămâna/ })
  await expect(sheet.getByLabel(/2\. Cât a scăzut/)).toHaveValue(/Talie 114,0 cm/)
  await sheet.getByLabel(/10\. Ce anume/).fill('Somnul.')
  await sheet.getByRole('button', { name: 'Salvează evaluarea' }).click()
  await expect(page.getByText(/Evaluare salvată pe/)).toBeVisible()

  // Persistență
  await page.reload()
  await typePin(page, '1234')
  await expect(page.getByRole('heading', { name: 'Progres' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Talie' })).toContainText('114,0')
  await expect(page.getByRole('button', { name: 'Vezi sau modifică evaluarea' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Evaluări anterioare' })).toBeVisible()
})
