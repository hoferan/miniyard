export type Country = { code: string; name: string }
export type Holiday = { date: string; localName: string; name: string }

/** How many years either side of the current year the year picker offers. */
export const YEAR_SPAN = 5

const COUNTRY_CODE = /^[A-Z]{2}$/
/** Nager.Date always sends zero-padded ISO calendar dates. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function buildYearOptions(currentYear: number): number[] {
  return Array.from({ length: YEAR_SPAN * 2 + 1 }, (_, i) => currentYear - YEAR_SPAN + i)
}

export function isValidCountryCode(value: unknown): value is string {
  return typeof value === 'string' && COUNTRY_CODE.test(value)
}

export function isValidYear(value: unknown, currentYear: number): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= currentYear - YEAR_SPAN &&
    value <= currentYear + YEAR_SPAN
  )
}

function readString(source: Record<string, unknown>, key: string): string | null {
  const value = source[key]
  if (typeof value !== 'string' || value.trim() === '') return null
  return value
}

function toRecords(raw: unknown): Record<string, unknown>[] {
  if (!Array.isArray(raw)) throw new Error('upstream')
  return raw.filter(
    (entry): entry is Record<string, unknown> =>
      typeof entry === 'object' && entry !== null && !Array.isArray(entry),
  )
}

/**
 * Normalises Nager.Date's AvailableCountries payload.
 *
 * Entries that do not carry a usable code and name are skipped rather than
 * failing the whole list — one bad row should not empty the country picker.
 */
export function parseCountries(raw: unknown): Country[] {
  const countries: Country[] = []

  for (const entry of toRecords(raw)) {
    const code = readString(entry, 'countryCode')
    const name = readString(entry, 'name')
    if (code === null || name === null || !COUNTRY_CODE.test(code)) continue
    countries.push({ code, name })
  }

  return countries.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Normalises Nager.Date's PublicHolidays payload, dropping the fields the UI
 * does not use. Sorted by date because the upstream order is not guaranteed.
 *
 * Dates are compared as strings: ISO calendar dates sort correctly
 * lexicographically, and no Date is constructed, so no timezone can shift one.
 */
export function parseHolidays(raw: unknown): Holiday[] {
  const holidays: Holiday[] = []

  for (const entry of toRecords(raw)) {
    const date = readString(entry, 'date')
    const localName = readString(entry, 'localName')
    if (date === null || localName === null || !ISO_DATE.test(date)) continue
    holidays.push({ date, localName, name: readString(entry, 'name') ?? localName })
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Formats an ISO calendar date for display.
 *
 * Built through Date.UTC and formatted in UTC on purpose: `new Date(iso)`
 * parses as UTC midnight, which renders as the previous day for anyone in a
 * negative-offset timezone. A public holiday is a calendar date, not an
 * instant, so the day the upstream sent must be the day shown.
 */
export function formatHolidayDate(iso: string): string {
  if (!ISO_DATE.test(iso)) return iso

  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(date.getTime())) return iso

  return DATE_FORMAT.format(date)
}

export function isPastHoliday(dateIso: string, todayIso: string): boolean {
  return dateIso < todayIso
}

/** Index of the first holiday on or after today, or -1 when all have passed. */
export function findNextHolidayIndex(holidays: Holiday[], todayIso: string): number {
  return holidays.findIndex((h) => !isPastHoliday(h.date, todayIso))
}
