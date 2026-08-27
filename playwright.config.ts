import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html'], ['json', { outputFile: 'test-results/results.json' }]]
    : 'html',
  // The suite runs against `next dev` (see webServer below), where a route is
  // compiled on demand the first time it is reached — measured at ~11s for a
  // cold `/utilities/[slug]`. Both budgets are widened past Playwright's
  // defaults (5s per assertion, 30s per test) to cover that first hit.
  timeout: 60_000,
  expect: {
    timeout: 20_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
