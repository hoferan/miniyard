'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CopyButtonProps {
  value: string
  className?: string
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!value) return
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(value)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = value
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      variant="ghost"
      size="icon"
      aria-label={copied ? 'Copied!' : 'Copy'}
      className={cn('h-8 w-8 text-muted-foreground', className)}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}
