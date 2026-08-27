import { test, expect } from '@playwright/test'

const COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'DE', name: 'Germany' },
]

const CURRENT_YEAR = new Date().getFullYear()

// One holiday firmly in the past and one firmly in the future for the current
// year, so the "Next" badge and the dimming both have something to act on
// whenever this suite happens to run.
const HOLIDAYS = [
  { date: `${CURRENT_YEAR}-01-01`, localName: 'Neujahr', name: "New Year's Day" },
  { date: `${CURRENT_YEAR}-12-25`, localName: 'Weihnachten', name: 'Christmas Day' },
]

// The app registers a Serwist service worker that handles every request.
// Playwright's page.route() does not intercept service-worker-initiated
// requests, so the worker must be blocked for the proxy mocks below to apply.
test.use({ serviceWorkers: 'block' })

/** Mocks both proxy operations; the holiday response is caller-controlled. */
async function mockProxy(
  page: import('@playwright/test').Page,
  holidays: unknown,
  status = 200,
): Promise<void> {
  await page.route('**/api/apis/public-holidays**', (route) => {
    const url = route.request().url()
    if (url.includes('op=countries')) return route.fulfill({ json: COUNTRIES })
    return route.fulfill({ status, json: holidays })
  })
}

async function selectCountry(page: import('@playwright/test').Page, name: string): Promise<void> {
  await page.getByRole('combobox', { name: 'Country' }).click()
  await page.getByRole('option', { name }).click()
}

test.describe('Public Holidays', () => {
  test('lists a country\'s holidays and flags the next upcoming one', async ({ page }) => {
    await mockProxy(page, HOLIDAYS)
    await page.goto('/apis/public-holidays')

    await selectCountry(page, 'Austria')

    // Local name and English name are both shown.
    await expect(page.getByText('Neujahr')).toBeVisible()
    await expect(page.getByText("New Year's Day")).toBeVisible()
    await expect(page.getByText('Weihnachten')).toBeVisible()
    await expect(page.getByText('2 holidays')).toBeVisible()

    // The date is rendered as a calendar date, never shifted by a timezone.
    await expect(page.getByText(`1 Jan ${CURRENT_YEAR}`)).toBeVisible()

    // Exactly one holiday is marked as next.
    await expect(page.getByText('Next', { exact: true })).toHaveCount(1)

    await page.screenshot({ path: 'test-results/public-holidays-list.png' })
  })

  test('shows an empty state when a country has no holidays that year', async ({ page }) => {
    await mockProxy(page, [])
    await page.goto('/apis/public-holidays')

    await selectCountry(page, 'Germany')

    await expect(
      page.getByText('No public holidays are listed for this country in this year.'),
    ).toBeVisible()
  })

  test('reports when no data exists for the selected country and year', async ({ page }) => {
    await mockProxy(page, { error: 'notFound' }, 404)
    await page.goto('/apis/public-holidays')

    await selectCountry(page, 'Austria')

    await expect(
      page.getByText('No holiday data is available for that country and year.'),
    ).toBeVisible()
  })

  test('refetches when the year changes', async ({ page }) => {
    const requestedYears: string[] = []
    await page.route('**/api/apis/public-holidays**', (route) => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('op') === 'countries') return route.fulfill({ json: COUNTRIES })
      requestedYears.push(url.searchParams.get('year') ?? '')
      return route.fulfill({ json: HOLIDAYS })
    })
    await page.goto('/apis/public-holidays')

    await selectCountry(page, 'Austria')
    await expect(page.getByText('Neujahr')).toBeVisible()

    await page.getByRole('combobox', { name: 'Year' }).click()
    await page.getByRole('option', { name: String(CURRENT_YEAR - 1) }).click()

    await expect.poll(() => requestedYears).toEqual([
      String(CURRENT_YEAR),
      String(CURRENT_YEAR - 1),
    ])

    // A past year has no "next" holiday to highlight.
    await expect(page.getByText('Next', { exact: true })).toHaveCount(0)
  })
})
