import { test, expect } from '@playwright/test'

const TWO_PART = {
  type: 'twopart',
  setup: 'Why do programmers prefer dark mode?',
  delivery: 'Because light attracts bugs.',
  category: 'Programming',
}

const SINGLE = {
  type: 'single',
  text: 'There are 10 types of people: those who understand binary and those who do not.',
  category: 'Programming',
}

// The app registers a Serwist service worker that handles every request.
// Playwright's page.route() does not intercept service-worker-initiated
// requests, so the worker must be blocked for the proxy mocks below to apply.
test.use({ serviceWorkers: 'block' })

test.describe('Random Joke', () => {
  test('fetches a two-part joke and reveals the punchline on tap', async ({ page }) => {
    await page.route('**/api/apis/random-joke**', (route) => route.fulfill({ json: TWO_PART }))
    await page.goto('/apis/random-joke')

    await page.getByRole('button', { name: 'Fetch another joke' }).click()

    await expect(page.getByText(TWO_PART.setup)).toBeVisible()
    // The punchline stays hidden until the reveal button is tapped.
    await expect(page.getByText(TWO_PART.delivery)).toBeHidden()

    await page.screenshot({ path: 'test-results/random-joke-setup.png' })

    await page.getByRole('button', { name: 'Show the punchline' }).click()
    await expect(page.getByText(TWO_PART.delivery)).toBeVisible()

    await page.screenshot({ path: 'test-results/random-joke-revealed.png' })
  })

  test('renders a single joke without a reveal button', async ({ page }) => {
    await page.route('**/api/apis/random-joke**', (route) => route.fulfill({ json: SINGLE }))
    await page.goto('/apis/random-joke')

    await page.getByRole('button', { name: 'Fetch another joke' }).click()

    await expect(page.getByText(SINGLE.text)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Show the punchline' })).toBeHidden()
  })

  test('resets the revealed punchline when the next joke is fetched', async ({ page }) => {
    await page.route('**/api/apis/random-joke**', (route) => route.fulfill({ json: TWO_PART }))
    await page.goto('/apis/random-joke')

    await page.getByRole('button', { name: 'Fetch another joke' }).click()
    await page.getByRole('button', { name: 'Show the punchline' }).click()
    await expect(page.getByText(TWO_PART.delivery)).toBeVisible()

    await page.getByRole('button', { name: 'Fetch another joke' }).click()
    await expect(page.getByText(TWO_PART.delivery)).toBeHidden()
    await expect(page.getByRole('button', { name: 'Show the punchline' })).toBeVisible()
  })

  test('shows a friendly message when no joke matches the filters', async ({ page }) => {
    await page.route('**/api/apis/random-joke**', (route) =>
      route.fulfill({ status: 404, json: { error: 'noMatch' } }),
    )
    await page.goto('/apis/random-joke')

    await page.getByRole('button', { name: 'Fetch another joke' }).click()

    await expect(
      page.getByText('No joke matched those filters. Try another category or turn safe mode off.'),
    ).toBeVisible()
  })
})
