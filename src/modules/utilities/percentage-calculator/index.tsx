'use client'

import { useState, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  percentOf,
  whatPercent,
  percentChange,
  formatResult,
  describeChange,
  type ChangeDirection,
} from './logic'
import { MESSAGES, ARIA, PLACEHOLDER } from './messages'

/** Inputs are held as strings, so a half-typed "-" or "." does not reset the field. */
function toNumber(raw: string): number {
  return raw.trim() === '' ? NaN : Number(raw)
}

const DIRECTION_CLASSES: Record<ChangeDirection, string> = {
  increase: 'text-emerald-600 dark:text-emerald-400',
  decrease: 'text-rose-600 dark:text-rose-400',
  none: 'text-foreground',
}

type NumberFieldProps = {
  label: string
  ariaLabel: string
  value: string
  onChange: (value: string) => void
}

function NumberField({ label, ariaLabel, value, onChange }: NumberFieldProps) {
  return (
    <label className="flex-1 min-w-0 space-y-1.5">
      <span className="block text-sm text-muted-foreground">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        aria-label={ariaLabel}
      />
    </label>
  )
}

function ResultRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-md bg-muted px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

export default function PercentageCalculator() {
  const [percentOfPercentage, setPercentOfPercentage] = useState('')
  const [percentOfValue, setPercentOfValue] = useState('')
  const [whatPercentValue, setWhatPercentValue] = useState('')
  const [whatPercentBase, setWhatPercentBase] = useState('')
  const [changeOld, setChangeOld] = useState('')
  const [changeNew, setChangeNew] = useState('')

  const percentOfResult = formatResult(
    percentOf(toNumber(percentOfPercentage), toNumber(percentOfValue))
  )
  const whatPercentResult = formatResult(
    whatPercent(toNumber(whatPercentValue), toNumber(whatPercentBase))
  )
  const change = describeChange(percentChange(toNumber(changeOld), toNumber(changeNew)))

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{MESSAGES.percentOfTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <NumberField
              label={MESSAGES.percentOfPercentageLabel}
              ariaLabel={ARIA.percentOfPercentage}
              value={percentOfPercentage}
              onChange={setPercentOfPercentage}
            />
            <NumberField
              label={MESSAGES.percentOfValueLabel}
              ariaLabel={ARIA.percentOfValue}
              value={percentOfValue}
              onChange={setPercentOfValue}
            />
          </div>
          <ResultRow label={MESSAGES.percentOfResultLabel}>
            <output aria-label={ARIA.percentOfResult} className="text-lg font-semibold tabular-nums">
              {percentOfResult}
            </output>
          </ResultRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{MESSAGES.whatPercentTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <NumberField
              label={MESSAGES.whatPercentValueLabel}
              ariaLabel={ARIA.whatPercentValue}
              value={whatPercentValue}
              onChange={setWhatPercentValue}
            />
            <NumberField
              label={MESSAGES.whatPercentBaseLabel}
              ariaLabel={ARIA.whatPercentBase}
              value={whatPercentBase}
              onChange={setWhatPercentBase}
            />
          </div>
          <ResultRow label={MESSAGES.whatPercentResultLabel}>
            <output
              aria-label={ARIA.whatPercentResult}
              className="text-lg font-semibold tabular-nums"
            >
              {whatPercentResult === PLACEHOLDER ? whatPercentResult : `${whatPercentResult}%`}
            </output>
          </ResultRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{MESSAGES.changeTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <NumberField
              label={MESSAGES.changeOldLabel}
              ariaLabel={ARIA.changeOld}
              value={changeOld}
              onChange={setChangeOld}
            />
            <NumberField
              label={MESSAGES.changeNewLabel}
              ariaLabel={ARIA.changeNew}
              value={changeNew}
              onChange={setChangeNew}
            />
          </div>
          <ResultRow label={MESSAGES.changeResultLabel}>
            <output
              aria-label={ARIA.changeResult}
              className={cn(
                'text-lg font-semibold tabular-nums',
                DIRECTION_CLASSES[change.direction]
              )}
            >
              {change.text}
            </output>
          </ResultRow>
        </CardContent>
      </Card>
    </div>
  )
}
