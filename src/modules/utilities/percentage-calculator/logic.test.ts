import { describe, it, expect } from 'vitest'
import { percentOf, whatPercent, percentChange, formatResult, describeChange } from './logic'
import { PLACEHOLDER } from './messages'

describe('percentOf', () => {
  it('calculates 20% of 50 as 10', () => {
    expect(percentOf(20, 50)).toBeCloseTo(10)
  })

  it('calculates 100% of 42 as 42', () => {
    expect(percentOf(100, 42)).toBeCloseTo(42)
  })

  it('calculates 0% of 99 as 0', () => {
    expect(percentOf(0, 99)).toBe(0)
  })

  it('calculates a percentage of zero as 0', () => {
    expect(percentOf(25, 0)).toBe(0)
  })

  it('handles a percentage above 100', () => {
    expect(percentOf(150, 200)).toBeCloseTo(300)
  })

  it('handles a negative percentage', () => {
    expect(percentOf(-10, 50)).toBeCloseTo(-5)
  })

  it('handles a negative value', () => {
    expect(percentOf(10, -50)).toBeCloseTo(-5)
  })

  it('handles decimal input', () => {
    expect(percentOf(12.5, 80)).toBeCloseTo(10)
  })

  it('returns null for NaN input', () => {
    expect(percentOf(NaN, 50)).toBeNull()
    expect(percentOf(20, NaN)).toBeNull()
  })

  it('returns null for Infinity input', () => {
    expect(percentOf(Infinity, 50)).toBeNull()
    expect(percentOf(20, -Infinity)).toBeNull()
  })
})

describe('whatPercent', () => {
  it('calculates 10 of 50 as 20%', () => {
    expect(whatPercent(10, 50)).toBeCloseTo(20)
  })

  it('calculates 50 of 50 as 100%', () => {
    expect(whatPercent(50, 50)).toBeCloseTo(100)
  })

  it('calculates 0 of 50 as 0%', () => {
    expect(whatPercent(0, 50)).toBe(0)
  })

  it('calculates a value larger than the base as above 100%', () => {
    expect(whatPercent(75, 50)).toBeCloseTo(150)
  })

  it('handles a negative value', () => {
    expect(whatPercent(-10, 50)).toBeCloseTo(-20)
  })

  it('handles a negative base', () => {
    expect(whatPercent(10, -50)).toBeCloseTo(-20)
  })

  it('returns null when the base is zero', () => {
    expect(whatPercent(10, 0)).toBeNull()
  })

  it('returns null when the base is negative zero', () => {
    expect(whatPercent(10, -0)).toBeNull()
  })

  it('returns null for NaN input', () => {
    expect(whatPercent(NaN, 50)).toBeNull()
    expect(whatPercent(10, NaN)).toBeNull()
  })

  it('returns null for Infinity input', () => {
    expect(whatPercent(Infinity, 50)).toBeNull()
  })
})

describe('percentChange', () => {
  it('calculates an increase from 80 to 100 as 25%', () => {
    expect(percentChange(80, 100)).toBeCloseTo(25)
  })

  it('calculates a decrease from 100 to 90 as -10%', () => {
    expect(percentChange(100, 90)).toBeCloseTo(-10)
  })

  it('calculates no change as 0', () => {
    expect(percentChange(50, 50)).toBe(0)
  })

  it('calculates a doubling as 100%', () => {
    expect(percentChange(10, 20)).toBeCloseTo(100)
  })

  it('uses the absolute old value so a rise from -50 to -25 is a 50% increase', () => {
    expect(percentChange(-50, -25)).toBeCloseTo(50)
  })

  it('uses the absolute old value so a fall from -50 to -75 is a 50% decrease', () => {
    expect(percentChange(-50, -75)).toBeCloseTo(-50)
  })

  it('handles a sign flip from -10 to 10 as a 200% increase', () => {
    expect(percentChange(-10, 10)).toBeCloseTo(200)
  })

  it('returns null when the old value is zero', () => {
    expect(percentChange(0, 100)).toBeNull()
  })

  it('returns null for NaN input', () => {
    expect(percentChange(NaN, 100)).toBeNull()
    expect(percentChange(80, NaN)).toBeNull()
  })

  it('returns null for Infinity input', () => {
    expect(percentChange(80, Infinity)).toBeNull()
  })
})

describe('formatResult', () => {
  it('renders the placeholder for null', () => {
    expect(formatResult(null)).toBe(PLACEHOLDER)
  })

  it('strips trailing zeros from a whole number', () => {
    expect(formatResult(25)).toBe('25')
  })

  it('strips trailing zeros from a one-decimal number', () => {
    expect(formatResult(25.5)).toBe('25.5')
  })

  it('rounds to two decimal places', () => {
    expect(formatResult(33.3333)).toBe('33.33')
  })

  it('rounds a repeating two-thirds to 66.67', () => {
    expect(formatResult(66.6666)).toBe('66.67')
  })

  it('rounds 0.005 up to 0.01 without float artefacts', () => {
    expect(formatResult(0.005)).toBe('0.01')
  })

  it('formats zero as 0', () => {
    expect(formatResult(0)).toBe('0')
  })

  it('formats a negative number with a hyphen-minus', () => {
    expect(formatResult(-12.5)).toBe('-12.5')
  })

  it('formats a very small number as 0', () => {
    expect(formatResult(0.0001)).toBe('0')
  })

  it('formats a large number without exponential notation', () => {
    expect(formatResult(1234567.891)).toBe('1234567.89')
  })
})

describe('describeChange', () => {
  it('describes null as the placeholder with no direction', () => {
    expect(describeChange(null)).toEqual({ text: PLACEHOLDER, direction: 'none' })
  })

  it('describes a positive change as an increase with a plus sign', () => {
    expect(describeChange(25)).toEqual({ text: '+25% increase', direction: 'increase' })
  })

  it('describes a negative change as a decrease with a typographic minus', () => {
    expect(describeChange(-10)).toEqual({ text: '−10% decrease', direction: 'decrease' })
  })

  it('describes zero as no change', () => {
    expect(describeChange(0)).toEqual({ text: '0% — no change', direction: 'none' })
  })

  it('rounds the percentage inside the description', () => {
    expect(describeChange(33.3333)).toEqual({ text: '+33.33% increase', direction: 'increase' })
  })

  it('treats a value that rounds to zero as no change', () => {
    expect(describeChange(0.0001)).toEqual({ text: '0% — no change', direction: 'none' })
  })
})
