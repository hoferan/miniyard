import { test, expect } from '@playwright/test'

test.describe('Percentage Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utilities/percentage-calculator')
  })

  test('loads with all three results showing the placeholder', async ({ page }) => {
    await expect(page.getByLabel('Percent of value result')).toHaveText('—')
    await expect(page.getByLabel('What percent of base result')).toHaveText('—')
    await expect(page.getByLabel('Percentage change result')).toHaveText('—')
    await page.screenshot({ path: 'test-results/percentage-calculator-idle.png' })
  })

  test('calculates what 20% of 50 is', async ({ page }) => {
    await page.getByLabel('Percentage for percent of value').fill('20')
    await page.getByLabel('Value for percent of value').fill('50')
    await expect(page.getByLabel('Percent of value result')).toHaveText('10')
  })

  test('calculates what percent 10 is of 50', async ({ page }) => {
    await page.getByLabel('Value for what percent of base').fill('10')
    await page.getByLabel('Base for what percent of base').fill('50')
    await expect(page.getByLabel('What percent of base result')).toHaveText('20%')
  })

  test('shows the placeholder when the base is zero', async ({ page }) => {
    await page.getByLabel('Value for what percent of base').fill('10')
    await page.getByLabel('Base for what percent of base').fill('0')
    await expect(page.getByLabel('What percent of base result')).toHaveText('—')
  })

  test('describes an increase and a decrease', async ({ page }) => {
    await page.getByLabel('Old value for percentage change').fill('80')
    await page.getByLabel('New value for percentage change').fill('100')
    await expect(page.getByLabel('Percentage change result')).toHaveText('+25% increase')

    await page.getByLabel('Old value for percentage change').fill('100')
    await page.getByLabel('New value for percentage change').fill('90')
    await expect(page.getByLabel('Percentage change result')).toHaveText('−10% decrease')
  })
})
