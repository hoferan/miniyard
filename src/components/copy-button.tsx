'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as Sentry from '@sentry/nextjs'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CopyButtonProps {
  value: string
  className?: string
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('copyButton')

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [])

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
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      resetTimerRef.current = setTimeout(() => {
        setCopied(false)
        resetTimerRef.current = null
      }, 2000)
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
      aria-label={copied ? t('copied') : t('copy')}
      className={cn('h-8 w-8 text-muted-foreground', className)}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}
