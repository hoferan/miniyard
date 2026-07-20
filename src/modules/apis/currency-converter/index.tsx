'use client'

import { useEffect, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  convert,
  formatAmount,
  formatRate,
  isSameCurrency,
  validateAmount,
  type Currency,
  type RateResult,
} from './logic'
import { fetchCurrencies, fetchRate } from './api'
import { ARIA, MESSAGES, type ErrorKey } from './messages'

type Result = { amount: number; rate: RateResult; from: string; to: string }

function pickDefault(codes: string[], preferred: string, fallbackIndex: number): string {
  return codes.includes(preferred) ? preferred : (codes[fallbackIndex] ?? codes[0] ?? '')
}

export default function CurrencyConverter() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loadingCurrencies, setLoadingCurrencies] = useState(true)
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<ErrorKey | null>(null)
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    let active = true
    fetchCurrencies()
      .then((list) => {
        if (!active) return
        setCurrencies(list)
        const codes = list.map((c) => c.code)
        setFrom(pickDefault(codes, 'USD', 0))
        setTo(pickDefault(codes, 'EUR', 1))
      })
      .catch(() => active && setError('currencyLoad'))
      .finally(() => active && setLoadingCurrencies(false))
    return () => {
      active = false
    }
  }, [])

  async function handleConvert() {
    setError(null)
    setResult(null)
    const validation = validateAmount(amount)
    if (!validation.valid) {
      setError(validation.errorKey)
      return
    }
    if (isSameCurrency(from, to)) {
      setResult({
        amount: validation.value,
        from,
        to,
        rate: { base: from, quote: to, rate: 1, date: '' },
      })
      return
    }
    setConverting(true)
    try {
      const rate = await fetchRate(from, to)
      setResult({ amount: validation.value, rate, from, to })
    } catch (e) {
      const key = (e as Error).message
      setError((key in MESSAGES.errors ? key : 'upstream') as ErrorKey)
    } finally {
      setConverting(false)
    }
  }

  function handleSwap() {
    setFrom(to)
    setTo(from)
    setResult(null)
  }

  if (loadingCurrencies) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">{MESSAGES.amountLabel}</Label>
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={MESSAGES.amountPlaceholder}
          aria-label={ARIA.amount}
        />
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0 space-y-2">
          <Label>{MESSAGES.fromLabel}</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger aria-label={ARIA.from}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          aria-label={ARIA.swap}
          className="shrink-0"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0 space-y-2">
          <Label>{MESSAGES.toLabel}</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger aria-label={ARIA.to}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleConvert} disabled={converting} className="w-full">
        {converting ? MESSAGES.converting : MESSAGES.convertButton}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{MESSAGES.errors[error]}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="rounded-lg border bg-card p-6 text-center space-y-2">
          <p className="text-3xl font-bold">
            {formatAmount(convert(result.amount, result.rate.rate))} {result.to}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatAmount(result.amount)} {result.from}
          </p>
          <p className="text-sm text-muted-foreground">
            {MESSAGES.unitRate(result.from, formatRate(result.rate.rate), result.to)}
          </p>
          {result.rate.date && (
            <p className="text-xs text-muted-foreground">{MESSAGES.asOf(result.rate.date)}</p>
          )}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <a
          href={MESSAGES.attributionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          {MESSAGES.attribution}
        </a>
      </p>
    </div>
  )
}
