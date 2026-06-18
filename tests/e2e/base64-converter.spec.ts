import { test, expect } from '@playwright/test'

test.describe('Base64 Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utilities/base64-converter')
  })

  test('loads in encode mode with both textareas visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Encode' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Decode' })).toBeVisible()
    await expect(page.getByLabel('Plain text')).toBeVisible()
    await page.screenshot({ path: 'test-results/base64-converter-idle.png' })
  })

  test('encodes plain text to Base64', async ({ page }) => {
    await page.getByLabel('Plain text').fill('hello')
    await expect(page.getByLabel('Base64')).toHaveValue('aGVsbG8=')
  })

  test('decodes Base64 back to plain text', async ({ page }) => {
    await page.getByRole('button', { name: 'Decode' }).click()
    await page.getByLabel('Base64').fill('aGVsbG8=')
    await expect(page.getByLabel('Plain text')).toHaveValue('hello')
  })

  test('shows error for invalid Base64 input', async ({ page }) => {
    await page.getByRole('button', { name: 'Decode' }).click()
    await page.getByLabel('Base64').fill('!!!invalid!!!')
    await expect(page.getByText('Invalid Base64 input', { exact: false })).toBeVisible()
  })

  test('switching mode clears the input', async ({ page }) => {
    await page.getByLabel('Plain text').fill('some text')
    await page.getByRole('button', { name: 'Decode' }).click()
    await expect(page.getByLabel('Base64')).toHaveValue('')
  })
})
