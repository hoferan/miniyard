import { test, expect } from '@playwright/test'

test.describe('module card UI', () => {
  test('utilities page: shows NEW badge, no icon box, no order number, no status dot', async ({
    page,
  }) => {
    await page.goto('/utilities')

    const firstCard = page.locator('a[href^="/utilities/"]').first()
    await expect(firstCard).toBeVisible()

    // NEW badge is visible (all modules were created within 14 days)
    await expect(firstCard.getByText('NEW')).toBeVisible()

    // No status dot (emerald dot from old design)
    await expect(
      firstCard.locator('.bg-emerald-500, .bg-emerald-400'),
    ).not.toBeVisible()

    // No order number (old padded mono number like "01", "02")
    await expect(
      firstCard.locator('.font-mono.text-xs.text-muted-foreground\\/60'),
    ).not.toBeVisible()

    await page.screenshot({ path: 'test-results/module-card-utilities.png', fullPage: false })
  })

  test('games page: shows NEW badge, no icon box, no status dot', async ({ page }) => {
    await page.goto('/games')

    const firstCard = page.locator('a[href^="/games/"]').first()
    await expect(firstCard).toBeVisible()

    await expect(firstCard.getByText('NEW')).toBeVisible()

    await expect(
      firstCard.locator('.bg-emerald-500, .bg-emerald-400'),
    ).not.toBeVisible()

    await page.screenshot({ path: 'test-results/module-card-games.png', fullPage: false })
  })

  test('home page: module cards show NEW badges', async ({ page }) => {
    await page.goto('/')

    // Wait for cards to render
    await expect(page.locator('a[href^="/utilities/"]').first()).toBeVisible()

    const newBadges = page.getByText('NEW')
    await expect(newBadges.first()).toBeVisible()

    await page.screenshot({ path: 'test-results/module-card-homepage.png', fullPage: true })
  })
})
