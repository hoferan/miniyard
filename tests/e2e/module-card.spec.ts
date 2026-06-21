import { test, expect } from '@playwright/test'

const MS_PER_DAY = 86_400_000

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 14 * MS_PER_DAY
}

// Mirror of meta.ts createdAt values — update when a module is added or its date changes
const utilityModules = [
  { slug: 'unit-converter', createdAt: '2026-06-07' },
  { slug: 'base64-converter', createdAt: '2026-06-08' },
  { slug: 'password-strength-checker', createdAt: '2026-06-19' },
]

const gameModules = [
  { slug: 'memory-card', createdAt: '2026-06-15' },
  { slug: 'typing-speed-test', createdAt: '2026-06-18' },
  { slug: 'reaction-time-test', createdAt: '2026-06-21' },
]

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

    const allModules = [...utilityModules, ...gameModules]
    const newCount = allModules.filter((m) => isNew(m.createdAt)).length

    await expect(page.getByText('NEW')).toHaveCount(newCount)

    await page.screenshot({ path: 'test-results/module-card-homepage.png', fullPage: true })
  })
})
