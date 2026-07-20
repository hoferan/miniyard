import { describe, it, expect } from 'vitest'
import {
  parseCurrencies,
  parseRate,
  validateAmount,
  isSameCurrency,
  convert,
  formatAmount,
  formatRate,
} from './logic'

describe('parseCurrencies', () => {
  it('maps iso_code→code and sorts by code', () => {
    const raw = [
      { iso_code: 'USD', name: 'US Dollar' },
      { iso_code: 'EUR', name: 'Euro' },
    ]
    expect(parseCurrencies(raw)).toEqual([
      { code: 'EUR', name: 'Euro' },
      { code: 'USD', name: 'US Dollar' },
    ])
  })

  it('drops entries missing a code or name', () => {
    const raw = [{ iso_code: 'USD', name: 'US Dollar' }, { iso_code: '', name: 'x' }, { name: 'y' }]
    expect(parseCurrencies(raw)).toEqual([{ code: 'USD', name: 'US Dollar' }])
  })

  it('throws when the payload is not an array', () => {
    expect(() => parseCurrencies({ nope: true })).toThrow()
  })
})

describe('parseRate', () => {
  it('extracts the first element of the rates array', () => {
    const raw = [{ date: '2026-07-20', base: 'USD', quote: 'EUR', rate: 0.87381 }]
    expect(parseRate(raw)).toEqual({ base: 'USD', quote: 'EUR', rate: 0.87381, date: '2026-07-20' })
  })

  it('throws on an empty array', () => {
    expect(() => parseRate([])).toThrow()
  })

  it('throws when rate is not a number', () => {
    expect(() => parseRate([{ date: '2026-07-20', base: 'USD', quote: 'EUR', rate: 'x' }])).toThrow()
  })
})

describe('validateAmount', () => {
  it('rejects an empty string', () => {
    expect(validateAmount('')).toEqual({ valid: false, errorKey: 'empty' })
  })
  it('rejects whitespace only', () => {
    expect(validateAmount('   ')).toEqual({ valid: false, errorKey: 'empty' })
  })
  it('rejects a non-number', () => {
    expect(validateAmount('abc')).toEqual({ valid: false, errorKey: 'notNumber' })
  })
  it('rejects a negative number', () => {
    expect(validateAmount('-5')).toEqual({ valid: false, errorKey: 'negative' })
  })
  it('accepts zero', () => {
    expect(validateAmount('0')).toEqual({ valid: true, value: 0 })
  })
  it('accepts a decimal', () => {
    expect(validateAmount('12.5')).toEqual({ valid: true, value: 12.5 })
  })
})

describe('isSameCurrency', () => {
  it('is true for identical codes', () => {
    expect(isSameCurrency('USD', 'USD')).toBe(true)
  })
  it('is false for different codes', () => {
    expect(isSameCurrency('USD', 'EUR')).toBe(false)
  })
})

describe('convert', () => {
  it('multiplies amount by rate', () => {
    expect(convert(100, 0.87381)).toBeCloseTo(87.381)
  })
  it('returns 0 for a zero amount', () => {
    expect(convert(0, 0.87381)).toBe(0)
  })
  it('is identity for rate 1', () => {
    expect(convert(42, 1)).toBe(42)
  })
})

describe('formatAmount', () => {
  it('formats to two decimals with grouping', () => {
    expect(formatAmount(1234.5)).toBe('1,234.50')
  })
  it('formats zero', () => {
    expect(formatAmount(0)).toBe('0.00')
  })
})

describe('formatRate', () => {
  it('formats to at most four decimals', () => {
    expect(formatRate(0.873814)).toBe('0.8738')
  })
})
