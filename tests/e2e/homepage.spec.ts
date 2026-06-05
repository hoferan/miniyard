import { test, expect } from '@playwright/test'

test('homepage loads and shows module cards', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/miniyard/)
  await expect(page.getByText('Unit Converter')).toBeVisible()
})

test('unit converter card navigates correctly', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Unit Converter').click()
  await expect(page).toHaveURL('/utilities/unit-converter')
})
