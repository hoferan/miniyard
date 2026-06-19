import * as React from 'react'
import { Label } from './label'
import { cn } from '@/lib/utils'

interface LabeledInputProps {
  label?: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}

export function LabeledInput({ label, htmlFor, children, className }: LabeledInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
    </div>
  )
}
