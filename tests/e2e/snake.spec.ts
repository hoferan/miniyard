import { test, expect } from '@playwright/test'

test.describe('Snake', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/snake')
  })

  test('loads with a Start button in the idle overlay', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
    await page.screenshot({ path: 'test-results/snake-idle.png' })
  })

  test('starts the game and hides the idle overlay', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByRole('button', { name: 'Start' })).toBeHidden()
    await page.keyboard.press('ArrowUp')
    await expect(page.getByText('Score:')).toBeVisible()
    await page.screenshot({ path: 'test-results/snake-playing.png' })
  })
})
