import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'miniyard',
    short_name: 'miniyard',
    description: 'A modular playground for useful tools and mini games.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f3ff',
    theme_color: '#7c6cff',
    icons: [
      { src: '/icon-192', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
