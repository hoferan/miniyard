import { test, expect } from '@playwright/test'

test.describe('Reaction Time Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/reaction-time-test')
  })

  test('loads in idle state with Tap to Start button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Tap to Start' })).toBeVisible()
    await page.screenshot({ path: 'test-results/reaction-time-test-idle.png' })
  })

  test('shows wait-for-green message after starting', async ({ page }) => {
    await page.getByRole('button', { name: 'Tap to Start' }).click()
    await expect(page.getByText('Wait for green…')).toBeVisible()
    await page.screenshot({ path: 'test-results/reaction-time-test-waiting.png' })
  })

  test('shows false start message when clicking too early', async ({ page }) => {
    await page.getByRole('button', { name: 'Tap to Start' }).click()
    await expect(page.getByText('Wait for green…')).toBeVisible()
    // Click the waiting screen — triggers false start
    await page.getByRole('button', { name: 'Wait for green…' }).click()
    await expect(page.getByText('Too early! Wait for green.')).toBeVisible()
    await page.screenshot({ path: 'test-results/reaction-time-test-false-start.png' })
  })

  test('shows reaction time after green screen click', async ({ page }) => {
    await page.getByRole('button', { name: 'Tap to Start' }).click()
    // Wait up to 5 s for green screen (max delay is 4 s)
    await expect(page.getByRole('button', { name: 'Click!' })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Click!' }).click()
    // Match the main result paragraph (e.g. "247 ms") — use first() to avoid strict-mode violation
    // when the same value also appears in personal best and history
    await expect(page.getByText(/\d+ ms/).first()).toBeVisible()
    await page.screenshot({ path: 'test-results/reaction-time-test-result.png' })
  })
})
