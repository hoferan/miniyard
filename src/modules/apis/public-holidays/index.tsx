'use client'

import { useEffect, useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  buildYearOptions,
  findNextHolidayIndex,
  formatHolidayDate,
  isPastHoliday,
  type Country,
  type Holiday,
} from './logic'
import { fetchCountries, fetchHolidays } from './api'
import { ARIA, MESSAGES, type ErrorKey } from './messages'

/** Today as a local calendar date — the day the user is actually living in. */
function todayIso(): string {
  return new Date().toLocaleDateString('en-CA')
}

export default function PublicHolidays() {
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const years = useMemo(() => buildYearOptions(currentYear), [currentYear])
  const today = useMemo(todayIso, [])

  const [countries, setCountries] = useState<Country[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [country, setCountry] = useState('')
  const [year, setYear] = useState(currentYear)

  const [holidays, setHolidays] = useState<Holiday[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorKey | null>(null)

  useEffect(() => {
    let active = true
    fetchCountries()
      .then((list) => {
        if (active) setCountries(list)
      })
      .catch(() => {
        if (active) setError('countryLoad')
      })
      .finally(() => {
        if (active) setCountriesLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!country) return

    let active = true
    setLoading(true)
    setError(null)

    fetchHolidays(country, year)
      .then((list) => {
        if (active) setHolidays(list)
      })
      .catch((e: Error) => {
        if (!active) return
        setError((e.message in MESSAGES.errors ? e.message : 'upstream') as ErrorKey)
        setHolidays(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [country, year])

  // A "next" holiday only means something in the year the user is currently in.
  const nextIndex = holidays && year === currentYear ? findNextHolidayIndex(holidays, today) : -1

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="holiday-country">{MESSAGES.countryLabel}</Label>
          <Select value={country} onValueChange={setCountry} disabled={countriesLoading}>
            <SelectTrigger id="holiday-country" aria-label={ARIA.country}>
              <SelectValue
                placeholder={
                  countriesLoading ? MESSAGES.loadingCountries : MESSAGES.countryPlaceholder
                }
              />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="holiday-year">{MESSAGES.yearLabel}</Label>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger id="holiday-year" aria-label={ARIA.year}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{MESSAGES.errors[error]}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!loading && holidays !== null && holidays.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">{MESSAGES.empty}</p>
      )}

      {!loading && holidays !== null && holidays.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{MESSAGES.countHint(holidays.length)}</p>

          <ul className="space-y-3" aria-label={ARIA.holidayList}>
            {holidays.map((holiday, index) => {
              const past = year === currentYear && isPastHoliday(holiday.date, today)

              return (
                <li
                  key={`${holiday.date}-${holiday.localName}`}
                  className={cn('rounded-lg border bg-card p-4', past && 'opacity-60')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {formatHolidayDate(holiday.date)}
                      </p>
                      <p className="font-semibold leading-tight">{holiday.localName}</p>
                      {holiday.name !== holiday.localName && (
                        <p className="text-sm text-muted-foreground">{holiday.name}</p>
                      )}
                    </div>
                    {index === nextIndex && <Badge className="shrink-0">{MESSAGES.nextBadge}</Badge>}
                  </div>
                </li>
              )
            })}
          </ul>
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
