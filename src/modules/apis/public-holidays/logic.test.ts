import { describe, it, expect } from 'vitest'
import {
  YEAR_SPAN,
  buildYearOptions,
  findNextHolidayIndex,
  formatHolidayDate,
  isPastHoliday,
  isValidCountryCode,
  isValidYear,
  parseCountries,
  parseHolidays,
  type Holiday,
} from './logic'

const rawHoliday = (over: Record<string, unknown> = {}) => ({
  date: '2026-01-01',
  localName: 'Neujahr',
  name: "New Year's Day",
  countryCode: 'AT',
  fixed: false,
  global: true,
  counties: null,
  launchYear: null,
  types: ['Public'],
  ...over,
})

const holiday = (date: string): Holiday => ({ date, localName: 'X', name: 'X' })

describe('buildYearOptions', () => {
  it('spans five years either side of the current year, ascending', () => {
    expect(buildYearOptions(2026)).toEqual([
      2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031,
    ])
  })

  it('always returns an odd count centred on the current year', () => {
    const years = buildYearOptions(1999)
    expect(years).toHaveLength(YEAR_SPAN * 2 + 1)
    expect(years[YEAR_SPAN]).toBe(1999)
  })

  it('does not hardcode a year — it follows whatever year it is given', () => {
    expect(buildYearOptions(2040)).toContain(2040)
    expect(buildYearOptions(2040)).not.toContain(2026)
  })
})

describe('isValidCountryCode', () => {
  it('accepts a two-letter uppercase ISO code', () => {
    expect(isValidCountryCode('AT')).toBe(true)
    expect(isValidCountryCode('US')).toBe(true)
  })

  it('rejects lowercase and mixed case', () => {
    expect(isValidCountryCode('at')).toBe(false)
    expect(isValidCountryCode('At')).toBe(false)
  })

  it('rejects codes of the wrong length', () => {
    expect(isValidCountryCode('A')).toBe(false)
    expect(isValidCountryCode('AUT')).toBe(false)
    expect(isValidCountryCode('')).toBe(false)
  })

  it('rejects an attempt to traverse the upstream path', () => {
    expect(isValidCountryCode('../AvailableCountries')).toBe(false)
    expect(isValidCountryCode('AT/../..')).toBe(false)
  })

  it('rejects an attempt to smuggle a query parameter', () => {
    expect(isValidCountryCode('AT?x=1')).toBe(false)
  })

  it('rejects non-strings', () => {
    expect(isValidCountryCode(null)).toBe(false)
    expect(isValidCountryCode(undefined)).toBe(false)
    expect(isValidCountryCode(42)).toBe(false)
  })
})

describe('isValidYear', () => {
  it('accepts the current year and both range boundaries', () => {
    expect(isValidYear(2026, 2026)).toBe(true)
    expect(isValidYear(2021, 2026)).toBe(true)
    expect(isValidYear(2031, 2026)).toBe(true)
  })

  it('rejects years just outside the range', () => {
    expect(isValidYear(2020, 2026)).toBe(false)
    expect(isValidYear(2032, 2026)).toBe(false)
  })

  it('rejects non-integers', () => {
    expect(isValidYear(2026.5, 2026)).toBe(false)
    expect(isValidYear(NaN, 2026)).toBe(false)
    expect(isValidYear(Infinity, 2026)).toBe(false)
  })

  it('rejects numeric strings — the caller must parse first', () => {
    expect(isValidYear('2026', 2026)).toBe(false)
  })

  it('rejects null and undefined', () => {
    expect(isValidYear(null, 2026)).toBe(false)
    expect(isValidYear(undefined, 2026)).toBe(false)
  })
})

describe('parseCountries', () => {
  it('normalises and sorts countries by name', () => {
    expect(
      parseCountries([
        { countryCode: 'AT', name: 'Austria' },
        { countryCode: 'AL', name: 'Albania' },
      ]),
    ).toEqual([
      { code: 'AL', name: 'Albania' },
      { code: 'AT', name: 'Austria' },
    ])
  })

  it('returns an empty array for an empty upstream list', () => {
    expect(parseCountries([])).toEqual([])
  })

  it('skips entries with a missing or malformed code', () => {
    expect(
      parseCountries([
        { countryCode: 'AT', name: 'Austria' },
        { countryCode: 'AUT', name: 'Austria long' },
        { name: 'Nowhere' },
        { countryCode: 'DE', name: '' },
      ]),
    ).toEqual([{ code: 'AT', name: 'Austria' }])
  })

  it.each([null, undefined, 'a string', 42, {}])('throws upstream for %o', (raw) => {
    expect(() => parseCountries(raw)).toThrow('upstream')
  })
})

describe('parseHolidays', () => {
  it('normalises to date, localName and name only', () => {
    expect(parseHolidays([rawHoliday()])).toEqual([
      { date: '2026-01-01', localName: 'Neujahr', name: "New Year's Day" },
    ])
  })

  it('sorts by date ascending regardless of upstream order', () => {
    const parsed = parseHolidays([
      rawHoliday({ date: '2026-12-26' }),
      rawHoliday({ date: '2026-01-01' }),
      rawHoliday({ date: '2026-08-15' }),
    ])
    expect(parsed.map((h) => h.date)).toEqual(['2026-01-01', '2026-08-15', '2026-12-26'])
  })

  it('keeps both holidays that fall on the same date', () => {
    const parsed = parseHolidays([
      rawHoliday({ date: '2026-01-01', localName: 'Neujahr' }),
      rawHoliday({ date: '2026-01-01', localName: 'Zweiter Feiertag' }),
    ])
    expect(parsed).toHaveLength(2)
  })

  it('returns an empty array when a country has no holidays that year', () => {
    expect(parseHolidays([])).toEqual([])
  })

  it('skips entries with a malformed date rather than failing the whole list', () => {
    const parsed = parseHolidays([
      rawHoliday({ date: '01/01/2026' }),
      rawHoliday({ date: '2026-1-1' }),
      rawHoliday({ date: '2026-05-01', localName: 'Staatsfeiertag' }),
    ])
    expect(parsed).toEqual([
      { date: '2026-05-01', localName: 'Staatsfeiertag', name: "New Year's Day" },
    ])
  })

  it('skips entries missing a local name', () => {
    expect(parseHolidays([rawHoliday({ localName: '   ' }), rawHoliday()])).toHaveLength(1)
  })

  it('falls back to the local name when the English name is missing', () => {
    expect(parseHolidays([rawHoliday({ name: undefined })])).toEqual([
      { date: '2026-01-01', localName: 'Neujahr', name: 'Neujahr' },
    ])
  })

  it.each([null, undefined, 'a string', 42, {}])('throws upstream for %o', (raw) => {
    expect(() => parseHolidays(raw)).toThrow('upstream')
  })
})

describe('formatHolidayDate', () => {
  it('formats a date as weekday, day, short month, year', () => {
    expect(formatHolidayDate('2026-01-01')).toBe('Thu, 1 Jan 2026')
  })

  it('keeps the calendar date the upstream sent, whatever the local timezone', () => {
    // new Date('2026-01-01') is UTC midnight, so a naive implementation renders
    // 31 Dec 2025 for anyone west of Greenwich. A public holiday is a calendar
    // date, not an instant, so the day component must survive verbatim.
    // Guarded by running this suite under TZ=America/New_York as well as UTC.
    for (const iso of ['2026-01-01', '2026-07-04', '2026-12-25']) {
      const [year, month, day] = iso.split('-')
      const formatted = formatHolidayDate(iso)
      expect(formatted).toContain(String(Number(day)))
      expect(formatted).toContain(year)
      expect(formatted).not.toContain(String(Number(year) - 1))
      expect(Number(month)).toBeGreaterThan(0)
    }
  })

  it('formats a year-end date without rolling into the next year', () => {
    expect(formatHolidayDate('2026-12-31')).toBe('Thu, 31 Dec 2026')
  })

  it('formats a leap day', () => {
    expect(formatHolidayDate('2028-02-29')).toBe('Tue, 29 Feb 2028')
  })

  it('returns the raw value unchanged when the date is unparseable', () => {
    expect(formatHolidayDate('not-a-date')).toBe('not-a-date')
  })
})

describe('isPastHoliday', () => {
  it('is true for a date before today', () => {
    expect(isPastHoliday('2026-08-26', '2026-08-27')).toBe(true)
  })

  it('is false for today — a holiday today has not passed', () => {
    expect(isPastHoliday('2026-08-27', '2026-08-27')).toBe(false)
  })

  it('is false for a future date', () => {
    expect(isPastHoliday('2026-12-25', '2026-08-27')).toBe(false)
  })

  it('compares across year boundaries', () => {
    expect(isPastHoliday('2025-12-25', '2026-01-01')).toBe(true)
  })
})

describe('findNextHolidayIndex', () => {
  const holidays = [holiday('2026-01-01'), holiday('2026-08-15'), holiday('2026-12-25')]

  it('finds the first holiday after today', () => {
    expect(findNextHolidayIndex(holidays, '2026-08-27')).toBe(2)
  })

  it('treats a holiday falling today as the next one', () => {
    expect(findNextHolidayIndex(holidays, '2026-08-15')).toBe(1)
  })

  it('returns the first entry when every holiday is still ahead', () => {
    expect(findNextHolidayIndex(holidays, '2025-06-01')).toBe(0)
  })

  it('returns -1 when every holiday has passed', () => {
    expect(findNextHolidayIndex(holidays, '2026-12-26')).toBe(-1)
  })

  it('returns -1 for an empty list', () => {
    expect(findNextHolidayIndex([], '2026-08-27')).toBe(-1)
  })
})
