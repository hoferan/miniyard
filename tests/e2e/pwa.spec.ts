import { test, expect } from '@playwright/test'
import { DEFAULT_LOCALE } from '../../src/i18n/config'

test('manifest.webmanifest is valid and has locale start_url', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest')
  expect(response.status()).toBe(200)
  const manifest = await response.json()
  expect(manifest.start_url).toMatch(new RegExp(`^\\/${DEFAULT_LOCALE}\\/`))
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.length).toBeGreaterThan(0)
})

test('service worker script is accessible', async ({ request }) => {
  const response = await request.get('/sw.js')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toMatch(/javascript/)
})

test('offline page returns 200', async ({ request }) => {
  const response = await request.get(`/${DEFAULT_LOCALE}/offline`)
  expect(response.status()).toBe(200)
})

test('PWA icons are accessible', async ({ request }) => {
  const icon192 = await request.get('/icon-192')
  expect(icon192.status()).toBe(200)
  expect(icon192.headers()['content-type']).toMatch(/image\/png/)

  const icon512 = await request.get('/icon-512')
  expect(icon512.status()).toBe(200)
  expect(icon512.headers()['content-type']).toMatch(/image\/png/)
})
