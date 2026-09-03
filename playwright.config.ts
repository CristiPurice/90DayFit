import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const BASE = '/90DayFit/'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    trace: 'retain-on-failure',
  },
  projects: [
    // Fluxurile principale pe motorul Safari, cu profil iPhone 15.
    {
      name: 'webkit-iphone',
      use: { ...devices['iPhone 15'] },
      testIgnore: /offline\.spec\.ts/,
    },
    // Testul offline rulează pe Chromium: WebKit din Playwright nu suportă
    // reîncărcarea în mod offline cu service worker activ (eroare internă).
    {
      name: 'chromium-offline',
      use: { ...devices['Pixel 7'] },
      testMatch: /offline\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
