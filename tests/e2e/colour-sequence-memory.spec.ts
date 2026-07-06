import { test, expect } from '@playwright/test'

test.describe('Colour Sequence Memory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/colour-sequence-memory')
  })

  test('loads with a Start button in the idle overlay', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
    await page.screenshot({ path: 'test-results/colour-sequence-memory-idle.png' })
  })

  test('starts the game and completes the first round by tapping the correct tile', async ({
    page,
  }) => {
    // Math.random is patched before any page script runs, so pickRandomTile
    // always resolves to tile index 0 ("Red") — makes the flashed sequence
    // deterministic for the test.
    await page.addInitScript(() => {
      Math.random = () => 0
    })
    await page.goto('/games/colour-sequence-memory')

    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByRole('button', { name: 'Start' })).toBeHidden()

    const redTile = page.getByRole('button', { name: 'Red' })
    await expect(redTile).toBeEnabled({ timeout: 5000 })
    await redTile.click()

    await expect(page.getByTestId('current-score')).toHaveText('1')
    await page.screenshot({ path: 'test-results/colour-sequence-memory-playing.png' })
  })
})
