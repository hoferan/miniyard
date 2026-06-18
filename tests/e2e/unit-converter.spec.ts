import { test, expect } from '@playwright/test'

test.describe('Unit Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utilities/unit-converter')
  })

  test('loads with category tabs and conversion inputs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Length' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Weight' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Temperature' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Volume' })).toBeVisible()
    await expect(page.getByLabel('Value to convert')).toBeVisible()
    await page.screenshot({ path: 'test-results/unit-converter-idle.png' })
  })

  test('converts a value and shows the result', async ({ page }) => {
    await page.getByLabel('Value to convert').fill('100')
    const result = page.getByLabel('Converted result')
    await expect(result).not.toHaveValue('')
    await expect(result).not.toHaveValue('0')
  })

  test('swap button exchanges from/to units and inverts the value', async ({ page }) => {
    await page.getByLabel('Value to convert').fill('1000')
    const resultBefore = await page.getByLabel('Converted result').inputValue()
    await page.getByRole('button', { name: 'Swap units' }).click()
    const inputAfter = await page.getByLabel('Value to convert').inputValue()
    expect(inputAfter).toBe(resultBefore)
  })

  test('switching category resets units and clears input', async ({ page }) => {
    await page.getByLabel('Value to convert').fill('42')
    await page.getByRole('button', { name: 'Temperature' }).click()
    await expect(page.getByLabel('Value to convert')).toHaveValue('')
  })
})
