import { test, expect } from '@playwright/test'

test.describe('propose module card', () => {
  test('home page shows propose links for both categories', async ({ page }) => {
    await page.goto('/')

    const utilitiesLink = page.locator(
      'a[href="https://github.com/hoferan/miniyard/issues/new?template=new_utility_tool.yml"]',
    )
    await expect(utilitiesLink).toBeVisible()
    await expect(utilitiesLink).toHaveAttribute('target', '_blank')
    await expect(utilitiesLink).toHaveAttribute('rel', 'noopener noreferrer')

    const gamesLink = page.locator(
      'a[href="https://github.com/hoferan/miniyard/issues/new?template=new_minigame.yml"]',
    )
    await expect(gamesLink).toBeVisible()
    await expect(gamesLink).toHaveAttribute('target', '_blank')
    await expect(gamesLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
