import { test, expect } from '@playwright/test'

test.describe('Password Strength Checker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utilities/password-strength-checker')
  })

  test('loads with empty input — bar visible but no label', async ({ page }) => {
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByRole('progressbar')).toBeVisible()
    await expect(page.getByText('Very Weak')).not.toBeVisible()
    await page.screenshot({ path: 'test-results/password-strength-checker-idle.png' })
  })

  test('shows strength label after typing', async ({ page }) => {
    await page.getByLabel('Password', { exact: true }).fill('hello')
    await expect(page.getByRole('progressbar')).toBeVisible()
    await expect(page.getByText('Very Weak')).toBeVisible()
  })

  test('shows green bar and no feedback for a strong password', async ({ page }) => {
    await page.getByLabel('Password', { exact: true }).fill('Xzwvutsrqp1!')
    await expect(page.getByText('Very Strong')).toBeVisible()
    await expect(page.getByText('How to improve:')).not.toBeVisible()
  })

  test('shows feedback bullets for a weak password', async ({ page }) => {
    await page.getByLabel('Password', { exact: true }).fill('hello')
    await expect(page.getByText('How to improve:')).toBeVisible()
    await expect(page.getByText('Use at least 8 characters')).toBeVisible()
  })

  test('show/hide toggle changes input type', async ({ page }) => {
    const input = page.getByLabel('Password', { exact: true })
    await expect(input).toHaveAttribute('type', 'password')
    await page.getByRole('button', { name: 'Show password' }).click()
    await expect(input).toHaveAttribute('type', 'text')
    await page.getByRole('button', { name: 'Hide password' }).click()
    await expect(input).toHaveAttribute('type', 'password')
  })
})
