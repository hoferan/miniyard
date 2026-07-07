import { test, expect } from '@playwright/test'

test.describe('Text Case Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/utilities/text-case-converter')
  })

  test('loads with all format rows empty by default', async ({ page }) => {
    await expect(page.getByLabel('UPPER CASE', { exact: true })).toHaveValue('')
    await expect(page.getByLabel('snake_case', { exact: true })).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Copy UPPER CASE value' })).toBeDisabled()
    await page.screenshot({ path: 'test-results/text-case-converter-idle.png' })
  })

  test('typing text updates all 9 format rows', async ({ page }) => {
    await page.getByLabel('Text', { exact: true }).fill('Hello World Example')
    await expect(page.getByLabel('UPPER CASE', { exact: true })).toHaveValue('HELLO WORLD EXAMPLE')
    await expect(page.getByLabel('lower case', { exact: true })).toHaveValue('hello world example')
    await expect(page.getByLabel('Title Case', { exact: true })).toHaveValue('Hello World Example')
    await expect(page.getByLabel('Sentence case', { exact: true })).toHaveValue('Hello world example')
    await expect(page.getByLabel('camelCase', { exact: true })).toHaveValue('helloWorldExample')
    await expect(page.getByLabel('PascalCase', { exact: true })).toHaveValue('HelloWorldExample')
    await expect(page.getByLabel('snake_case', { exact: true })).toHaveValue('hello_world_example')
    await expect(page.getByLabel('kebab-case', { exact: true })).toHaveValue('hello-world-example')
    await expect(page.getByLabel('SCREAMING_SNAKE_CASE', { exact: true })).toHaveValue('HELLO_WORLD_EXAMPLE')
  })

  test('copy buttons are present and enabled once there is output', async ({ page }) => {
    await page.getByLabel('Text', { exact: true }).fill('Hello World')
    await expect(page.getByRole('button', { name: 'Copy UPPER CASE value' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Copy snake_case value' })).toBeEnabled()
  })
})
