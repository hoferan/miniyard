// Compiled by @serwist/next via webpack — type-checked via tsconfig.worker.json
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, NetworkFirst } from 'serwist'
import { defaultCache } from '@serwist/next/worker'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: WorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Explicit NetworkFirst for all HTML navigation requests so Chrome's
    // PWA installability check sees the SW calling event.respondWith() for
    // start_url. Without this, defaultCache silently passes navigation
    // requests through without responding, and Chrome considers the SW as
    // not handling the page — blocking the install prompt.
    {
      matcher: ({ request }) => request.destination === 'document',
      handler: new NetworkFirst({ cacheName: 'pages', networkTimeoutSeconds: 10 }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document'
        },
      },
    ],
  },
})

serwist.addEventListeners()
