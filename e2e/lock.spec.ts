import { test, expect } from '@playwright/test'
import { completeOnboarding, typePin } from './helpers'

test('după reîncărcare aplicația cere PIN-ul și îl validează', async ({ page }) => {
  await completeOnboarding(page, '2580')

  await page.reload()
  await expect(page.getByText('Blocat')).toBeVisible()
  await expect(page.getByRole('heading', { name: '90 Day Fit' })).toBeVisible()

  await typePin(page, '9999')
  await expect(page.getByRole('status')).toHaveText('PIN greșit')

  await typePin(page, '2580')
  await expect(page.getByRole('heading', { name: 'Azi' })).toBeVisible()
})

test('setările persistă între sesiuni', async ({ page }) => {
  await completeOnboarding(page, '1357')
  const rows = await page.evaluate(async () => {
    const req = indexedDB.open('ninetyDayFit')
    const dbi = await new Promise<IDBDatabase>((res, rej) => {
      req.onsuccess = () => res(req.result)
      req.onerror = () => rej(req.error)
    })
    const tx = dbi.transaction('settings', 'readonly')
    const all = tx.objectStore('settings').getAll()
    return new Promise<{ key: string; value: unknown }[]>((res) => {
      all.onsuccess = () => res(all.result as { key: string; value: unknown }[])
    })
  })
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  expect(map.onboarded).toBe(true)
  expect(map.theme).toBe('coach')
  expect(map.startKg).toBe(130)
  expect(map.targetKg).toBe(115)
  expect(typeof map.pinHash).toBe('string')
})
