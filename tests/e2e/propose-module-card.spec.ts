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

  test('utilities page shows a propose-a-utility link', async ({ page }) => {
    await page.goto('/utilities')

    const link = page.locator(
      'a[href="https://github.com/hoferan/miniyard/issues/new?template=new_utility_tool.yml"]',
    )
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('games page shows a propose-a-game link', async ({ page }) => {
    await page.goto('/games')

    const link = page.locator(
      'a[href="https://github.com/hoferan/miniyard/issues/new?template=new_minigame.yml"]',
    )
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')
  })
})
