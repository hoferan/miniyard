import { test, expect } from '@playwright/test'

test('homepage loads and shows module cards', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/miniyard/)
  await expect(page.getByRole('link', { name: /Unit Converter/i })).toBeVisible()
})

test('unit converter card navigates correctly', async ({ page }) => {
  await page.goto('/')
  const card = page.getByRole('link', { name: /Unit Converter/i }).first()
  await expect(card).toBeVisible()

  // The card is a Next <Link>. A click that lands while the app is still
  // hydrating gets swallowed: React attaches its handler and prevents the
  // browser's default navigation before the router is ready to fetch the
  // route, so nothing happens at all — no request, no URL change, no error.
  // Against `next dev` the route is also compiled on demand, which widens that
  // window. Retry the click until the URL actually changes.
  await expect(async () => {
    await card.click()
    await expect(page).toHaveURL('/utilities/unit-converter', { timeout: 10_000 })
  }).toPass({ timeout: 45_000 })
})
