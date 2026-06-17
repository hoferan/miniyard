import { test, expect } from '@playwright/test'

test('homepage loads and shows module cards', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/miniyard/)
  await expect(page.getByRole('link', { name: /Unit Converter/i })).toBeVisible()
})

test('unit converter card navigates correctly', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Unit Converter/i }).first().click()
  await expect(page).toHaveURL('/en/utilities/unit-converter')
})
