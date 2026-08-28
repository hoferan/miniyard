import { test, expect } from '@playwright/test'

test('homepage loads and shows module cards', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/miniyard/)

  // The homepage previews only the newest few modules per category, so asserting
  // on one module by name breaks as soon as it ages out of that preview. Assert
  // on the sections and on the presence of cards instead.
  await expect(page.getByRole('heading', { name: 'Utilities', level: 2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Games', level: 2 })).toBeVisible()
  await expect(page.locator('a[href^="/utilities/"]').first()).toBeVisible()
  await expect(page.locator('a[href^="/games/"]').first()).toBeVisible()
})

test('unit converter card navigates correctly', async ({ page }) => {
  await page.goto('/')

  // Unit Converter is one of the oldest modules and no longer fits in the
  // homepage's newest-first preview, so search for it to bring its card into the
  // grid. Search runs against the whole registry, which keeps this independent of
  // how many modules the preview happens to show.
  const search = page.getByLabel('Search modules')
  const card = page.getByRole('link', { name: /Unit Converter/i }).first()

  // Filling the box only filters once the client component has hydrated, so retry
  // until the card actually appears.
  await expect(async () => {
    await search.fill('Unit Converter')
    await expect(card).toBeVisible({ timeout: 5_000 })
  }).toPass({ timeout: 45_000 })

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
