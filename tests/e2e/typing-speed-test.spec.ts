import { test, expect } from '@playwright/test'

test.describe('Typing Speed Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/typing-speed-test')
  })

  test('loads in idle state with start prompt visible', async ({ page }) => {
    await expect(page.getByText('Click here and start typing')).toBeVisible()
    // Timer shows initial 60 s (exact match to avoid colliding with description text)
    await expect(page.getByText('60 s', { exact: true })).toBeVisible()
    await page.screenshot({ path: 'test-results/typing-speed-test-idle.png' })
  })

  test('hides overlay and begins game when user starts typing', async ({ page }) => {
    await page.getByRole('button', { name: /typing area/i }).click()
    await page.keyboard.type('a')

    await expect(page.getByText('Click here and start typing')).not.toBeVisible()
    await page.screenshot({ path: 'test-results/typing-speed-test-playing.png' })
  })

  test('results card is not shown before game ends', async ({ page }) => {
    await expect(page.getByText('Results')).not.toBeVisible()
  })
})
