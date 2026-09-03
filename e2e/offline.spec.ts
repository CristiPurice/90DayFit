import { test, expect } from '@playwright/test'
import { completeOnboarding, typePin } from './helpers'

/** Service worker activ și precache complet (index + JS + CSS + fonturi). */
async function swReady(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg?.active?.state !== 'activated') return false
    const keys = await caches.keys()
    const precache = keys.find((k) => k.includes('precache'))
    if (!precache) return false
    const urls = (await (await caches.open(precache)).keys()).map((r) => r.url)
    const has = (part: string) => urls.some((u) => u.includes(part))
    return has('index.html') && has('/assets/index-') && has('.woff2')
  })
}

test('aplicația se deschide și se deblochează fără internet', async ({ page, context }) => {
  await completeOnboarding(page, '1234')

  await expect
    .poll(() => swReady(page), { timeout: 30_000, message: 'service worker-ul nu a terminat precache-ul' })
    .toBe(true)

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByText('Blocat')).toBeVisible()
  await typePin(page, '1234')
  await expect(page.getByRole('heading', { name: 'Azi' })).toBeVisible()
  await context.setOffline(false)
})
