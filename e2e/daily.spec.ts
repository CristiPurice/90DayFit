import { test, expect } from '@playwright/test'
import { completeOnboarding, typePin } from './helpers'

test('zilnicul: greutate, apă, pași, tensiune, persistente după reîncărcare', async ({ page }) => {
  await completeOnboarding(page, '1234')

  // Greutate
  await page.getByRole('button', { name: 'Greutate' }).click()
  const wDialog = page.getByRole('dialog', { name: 'Greutatea de azi' })
  await wDialog.getByLabel('Greutate').fill('129,4')
  await wDialog.getByRole('button', { name: 'Salvează' }).click()
  await expect(page.getByText(/^129,4/)).toBeVisible()

  // Apă
  await page.getByRole('button', { name: '+500 ml' }).click()
  await page.getByRole('button', { name: '+500 ml' }).click()
  await expect(page.getByText(/^1,0 ?[/]/)).toBeVisible()

  // Pași
  await page.getByRole('button', { name: 'Pași' }).click()
  const sDialog = page.getByRole('dialog', { name: 'Pașii de azi' })
  await sDialog.getByLabel('Pași').fill('6240')
  await sDialog.getByRole('button', { name: 'Salvează' }).click()
  await expect(page.getByText('6.240')).toBeVisible()

  // Tensiune dimineață
  await page.getByRole('button', { name: 'Tensiune dimineață' }).click()
  let bDialog = page.getByRole('dialog')
  await bDialog.getByLabel('Sistolică').fill('126')
  await bDialog.getByLabel('Diastolică').fill('78')
  await bDialog.getByRole('button', { name: 'Salvează' }).click()
  const am = page.getByRole('button', { name: 'Tensiune dimineață' })
  await expect(am).toContainText('126/78')
  await expect(am).toContainText('În regulă')

  // Tensiune seară
  await page.getByRole('button', { name: 'Tensiune seară' }).click()
  bDialog = page.getByRole('dialog')
  await bDialog.getByLabel('Sistolică').fill('124')
  await bDialog.getByLabel('Diastolică').fill('80')
  await bDialog.getByRole('button', { name: 'Salvează' }).click()
  const pm = page.getByRole('button', { name: 'Tensiune seară' })
  await expect(pm).toContainText('124/80')
  await expect(pm).toContainText('Atenție')

  // Persistență
  await page.reload()
  await typePin(page, '1234')
  await expect(page.getByRole('heading', { name: 'Azi' })).toBeVisible()
  await expect(page.getByText(/^129,4/)).toBeVisible()
  await expect(page.getByText(/^1,0 ?[/]/)).toBeVisible()
  await expect(page.getByText('6.240')).toBeVisible()
  await expect(page.getByText('126/78')).toBeVisible()
  await expect(page.getByText('124/80')).toBeVisible()

  // Setări accesibile din antet
  await page.getByRole('link', { name: 'Setări' }).click()
  await expect(page.getByRole('heading', { name: 'Setări' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Exportă backup' })).toBeVisible()
  await page.getByRole('link', { name: 'Înapoi' }).click()
  await expect(page.getByRole('heading', { name: 'Azi' })).toBeVisible()
})
