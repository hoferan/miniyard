import { test, expect } from '@playwright/test'

const CURRENCIES = [
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'USD', name: 'US Dollar' },
]

// The app registers a Serwist service worker that handles every request.
// Playwright's page.route() does not intercept service-worker-initiated
// requests, so the worker must be blocked for the proxy mocks below to apply.
test.use({ serviceWorkers: 'block' })

test.describe('Currency Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/apis/currency-converter**', async (route) => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('op') === 'currencies') {
        await route.fulfill({ json: CURRENCIES })
        return
      }
      await route.fulfill({
        json: { base: 'USD', quote: 'EUR', rate: 0.87381, date: '2026-07-20' },
      })
    })
    await page.goto('/apis/currency-converter')
  })

  test('loads controls and converts an amount', async ({ page }) => {
    await expect(page.getByLabel('Amount to convert')).toBeVisible()
    await page.getByLabel('Amount to convert').fill('100')
    await page.getByRole('button', { name: 'Convert' }).click()
    await expect(page.getByText('87.38 EUR')).toBeVisible()
    await expect(page.getByText('1 USD = 0.8738 EUR')).toBeVisible()
    await expect(page.getByText('Rates as of 2026-07-20')).toBeVisible()
    await page.screenshot({ path: 'test-results/currency-converter-result.png' })
  })

  test('shows an error for an empty amount', async ({ page }) => {
    await page.getByLabel('Amount to convert').fill('')
    await page.getByRole('button', { name: 'Convert' }).click()
    await expect(page.getByText('Enter an amount.')).toBeVisible()
  })
})
