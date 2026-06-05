// TODO: REVERT — remove this file and its usage in src/app/page.tsx after Sentry has been
// verified to work in all environments (dev, staging, production). It must not ship permanently.
'use client'

import * as Sentry from '@sentry/nextjs'
import { useState } from 'react'

export function SentryTestButton() {
  const [sent, setSent] = useState(false)

  function handleClick() {
    Sentry.captureException(new Error('Sentry test button — manual trigger'))
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleClick}
        className="rounded bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground shadow-md hover:bg-destructive/90"
      >
        {sent ? 'Sent to Sentry ✓' : 'Test Sentry'}
      </button>
    </div>
  )
}
