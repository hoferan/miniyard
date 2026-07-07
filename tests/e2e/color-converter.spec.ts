import { test, expect } from '@playwright/test'

test.describe('Color Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utilities/color-converter')
  })

  test('loads with the default color populated in all three formats', async ({ page }) => {
    await expect(page.getByLabel('Hex color value')).toHaveValue('#3b82f6')
    await expect(page.getByLabel('Red (0-255)')).toHaveValue('59')
    await expect(page.getByLabel('Green (0-255)')).toHaveValue('130')
    await expect(page.getByLabel('Blue (0-255)')).toHaveValue('246')
    await expect(page.getByLabel('Hue (0-360)')).toHaveValue('217')
    await expect(page.getByRole('img', { name: 'Live color preview' })).toHaveCSS(
      'background-color',
      'rgb(59, 130, 246)'
    )
    await page.screenshot({ path: 'test-results/color-converter-idle.png' })
  })

  test('editing the HEX field updates RGB and HSL', async ({ page }) => {
    await page.getByLabel('Hex color value').fill('#ff0000')
    await expect(page.getByLabel('Red (0-255)')).toHaveValue('255')
    await expect(page.getByLabel('Green (0-255)')).toHaveValue('0')
    await expect(page.getByLabel('Blue (0-255)')).toHaveValue('0')
    await expect(page.getByLabel('Hue (0-360)')).toHaveValue('0')
    await expect(page.getByLabel('Saturation percent (0-100)')).toHaveValue('100')
    await expect(page.getByLabel('Lightness percent (0-100)')).toHaveValue('50')
    await expect(page.getByRole('img', { name: 'Live color preview' })).toHaveCSS(
      'background-color',
      'rgb(255, 0, 0)'
    )
  })

  test('editing an RGB field updates HEX and HSL', async ({ page }) => {
    await page.getByLabel('Red (0-255)').fill('0')
    await expect(page.getByLabel('Hex color value')).toHaveValue('#0082f6')
    await expect(page.getByLabel('Hue (0-360)')).toHaveValue('208')
  })

  test('invalid HEX input shows an inline error without clearing the swatch', async ({ page }) => {
    await page.getByLabel('Hex color value').fill('not-a-color')
    await expect(page.getByText('Enter a valid hex color', { exact: false })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Live color preview' })).toHaveCSS(
      'background-color',
      'rgb(59, 130, 246)'
    )
  })

  test('copy buttons are present for all three formats', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Copy hex value' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy RGB value' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy HSL value' })).toBeVisible()
  })
})
