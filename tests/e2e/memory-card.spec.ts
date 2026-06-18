import { test, expect } from '@playwright/test'

test.describe('Memory Card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/memory-card')
  })

  test('loads with 16 hidden cards and move/time counters', async ({ page }) => {
    const hiddenCards = page.getByRole('button', { name: 'Hidden card' })
    await expect(hiddenCards).toHaveCount(16)
    await expect(page.getByText('Moves:')).toBeVisible()
    await expect(page.getByText('Time:')).toBeVisible()
    await page.screenshot({ path: 'test-results/memory-card-idle.png' })
  })

  test('flipping a card reveals its emoji', async ({ page }) => {
    const firstCard = page.getByRole('button', { name: 'Hidden card' }).first()
    await firstCard.click()
    // After flip the card is no longer labelled "Hidden card"
    await expect(page.getByRole('button', { name: 'Hidden card' })).toHaveCount(15)
  })

  test('move counter increments after two cards are flipped', async ({ page }) => {
    const hidden = page.getByRole('button', { name: 'Hidden card' })
    await hidden.nth(0).click()
    await hidden.nth(1).click()
    await expect(page.getByText('1', { exact: true })).toBeVisible()
  })

  test('new game button resets the board', async ({ page }) => {
    await page.getByRole('button', { name: 'Hidden card' }).first().click()
    await page.getByRole('button', { name: 'New Game' }).click()
    await expect(page.getByRole('button', { name: 'Hidden card' })).toHaveCount(16)
  })
})
