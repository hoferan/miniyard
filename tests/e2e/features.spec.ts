import { test, expect } from '@playwright/test'

test.describe('Experimental features — tag filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('miniyard-features'))
  })

  test('tag chips are hidden by default on the Tools page', async ({ page }) => {
    await page.goto('/utilities')
    await expect(page.getByRole('button', { name: 'units' })).not.toBeVisible()
    await page.screenshot({
      path: 'tests/e2e/screenshots/tag-filter-disabled.png',
      fullPage: true,
    })
  })

  test('tag chips appear after enabling the feature on the Labs page', async ({ page }) => {
    await page.goto('/features')
    await page.getByRole('switch', { name: /tag-based module filtering/i }).click()
    await page.goto('/utilities')
    await expect(page.getByRole('button', { name: 'units' })).toBeVisible()
    await page.screenshot({
      path: 'tests/e2e/screenshots/tag-filter-enabled.png',
      fullPage: true,
    })
  })

  test('clicking a tag filters the grid and updates the URL', async ({ page }) => {
    await page.evaluate(() =>
      localStorage.setItem('miniyard-features', JSON.stringify({ 'tag-filter': true })),
    )
    await page.goto('/utilities')
    await page.getByRole('button', { name: 'math' }).click()
    await expect(page).toHaveURL(/\?tag=math/)
    await expect(page.getByText('Unit Converter')).toBeVisible()
    await expect(page.getByText('Base64 Encoder / Decoder')).not.toBeVisible()
  })

  test('clicking the active tag clears the filter', async ({ page }) => {
    await page.evaluate(() =>
      localStorage.setItem('miniyard-features', JSON.stringify({ 'tag-filter': true })),
    )
    await page.goto('/utilities?tag=math')
    await page.getByRole('button', { name: 'math' }).click()
    await expect(page).not.toHaveURL(/tag=/)
    await expect(page.getByText('Base64 Encoder / Decoder')).toBeVisible()
  })
})
