import { test, expect } from '@playwright/test'
import { registry, sortModulesByNewest } from '@/lib/registry'
import { isNew } from '@/lib/utils'

// Sourced directly from the real registry so this test never drifts when a
// module is added, removed, or its createdAt changes.
const utilityModules = registry.filter((m) => m.category === 'utilities')
const gameModules = registry.filter((m) => m.category === 'games')

// Mirrors HOME_PREVIEW_LIMIT in src/components/home-search.tsx — the home
// page only renders the 5 newest modules per category.
const HOME_PREVIEW_LIMIT = 5

// Every category the home page renders, derived from the registry so this
// stays correct as new categories (e.g. apis) gain their first module.
const allCategories = [...new Set(registry.map((m) => m.category))]

test.describe('module card UI', () => {
  test('utilities page: NEW badge matches creation date for each card', async ({ page }) => {
    await page.goto('/utilities')

    for (const mod of utilityModules) {
      const card = page.locator(`a[href="/utilities/${mod.slug}"]`)
      await expect(card).toBeVisible()
      if (isNew(mod.createdAt)) {
        await expect(card.getByText('NEW')).toBeVisible()
      } else {
        await expect(card.getByText('NEW')).not.toBeVisible()
      }
    }

    // No status dot (emerald dot from old design)
    await expect(
      page.locator('a[href^="/utilities/"]').first().locator('.bg-emerald-500, .bg-emerald-400'),
    ).not.toBeVisible()

    // No order number (old padded mono number like "01", "02")
    await expect(
      page.locator('a[href^="/utilities/"]').first().locator('.font-mono.text-xs.text-muted-foreground\\/60'),
    ).not.toBeVisible()

    await page.screenshot({ path: 'test-results/module-card-utilities.png', fullPage: false })
  })

  test('games page: NEW badge matches creation date for each card', async ({ page }) => {
    await page.goto('/games')

    for (const mod of gameModules) {
      const card = page.locator(`a[href="/games/${mod.slug}"]`)
      await expect(card).toBeVisible()
      if (isNew(mod.createdAt)) {
        await expect(card.getByText('NEW')).toBeVisible()
      } else {
        await expect(card.getByText('NEW')).not.toBeVisible()
      }
    }

    // No status dot (emerald dot from old design)
    await expect(
      page.locator('a[href^="/games/"]').first().locator('.bg-emerald-500, .bg-emerald-400'),
    ).not.toBeVisible()

    await page.screenshot({ path: 'test-results/module-card-games.png', fullPage: false })
  })

  test('home page: NEW badge count matches number of recently created modules', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('a[href^="/utilities/"]').first()).toBeVisible()

    // Count NEW badges across every category the home page previews, not just
    // utilities and games — otherwise adding a recent module in another
    // category (e.g. apis) makes the on-page count exceed this expectation.
    const visibleAcrossCategories = allCategories.flatMap((category) =>
      sortModulesByNewest(registry.filter((m) => m.category === category)).slice(0, HOME_PREVIEW_LIMIT),
    )
    const newCount = visibleAcrossCategories.filter((m) => isNew(m.createdAt)).length

    await expect(page.getByText('NEW', { exact: true })).toHaveCount(newCount)

    await page.screenshot({ path: 'test-results/module-card-homepage.png', fullPage: true })
  })
})
