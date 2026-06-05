'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <button
          onClick={reset}
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
