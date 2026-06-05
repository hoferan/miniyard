import { describe, it, expect } from 'vitest'
import { convert, getCategories, getUnits } from './logic'

describe('getCategories', () => {
  it('returns all four categories', () => {
    const cats = getCategories()
    const ids = cats.map((c) => c.id)
    expect(ids).toContain('length')
    expect(ids).toContain('weight')
    expect(ids).toContain('temperature')
    expect(ids).toContain('volume')
  })
})

describe('getUnits', () => {
  it('returns units for each category', () => {
    expect(getUnits('length').length).toBeGreaterThanOrEqual(4)
    expect(getUnits('weight').length).toBeGreaterThanOrEqual(4)
    expect(getUnits('temperature').length).toBe(3)
    expect(getUnits('volume').length).toBeGreaterThanOrEqual(4)
  })
})

describe('convert – length', () => {
  it('1 km = 1000 m', () => {
    expect(convert(1, 'km', 'm', 'length')).toBeCloseTo(1000)
  })

  it('1 m = 100 cm', () => {
    expect(convert(1, 'm', 'cm', 'length')).toBeCloseTo(100)
  })

  it('1 mi ≈ 1.609 km', () => {
    expect(convert(1, 'mi', 'km', 'length')).toBeCloseTo(1.609344)
  })

  it('1 ft ≈ 0.3048 m', () => {
    expect(convert(1, 'ft', 'm', 'length')).toBeCloseTo(0.3048)
  })

  it('12 in = 1 ft', () => {
    expect(convert(12, 'in', 'ft', 'length')).toBeCloseTo(1)
  })

  it('identity: 5 m = 5 m', () => {
    expect(convert(5, 'm', 'm', 'length')).toBe(5)
  })

  it('zero: 0 km = 0 m', () => {
    expect(convert(0, 'km', 'm', 'length')).toBe(0)
  })

  it('negative: -10 m in cm', () => {
    expect(convert(-10, 'm', 'cm', 'length')).toBeCloseTo(-1000)
  })
})

describe('convert – weight', () => {
  it('1 kg = 1000 g', () => {
    expect(convert(1, 'kg', 'g', 'weight')).toBeCloseTo(1000)
  })

  it('1 lb ≈ 453.592 g', () => {
    expect(convert(1, 'lb', 'g', 'weight')).toBeCloseTo(453.592)
  })

  it('16 oz = 1 lb', () => {
    expect(convert(16, 'oz', 'lb', 'weight')).toBeCloseTo(1)
  })

  it('identity: 5 kg = 5 kg', () => {
    expect(convert(5, 'kg', 'kg', 'weight')).toBe(5)
  })

  it('zero: 0 kg = 0 g', () => {
    expect(convert(0, 'kg', 'g', 'weight')).toBe(0)
  })
})

describe('convert – temperature', () => {
  it('0 °C = 32 °F', () => {
    expect(convert(0, 'c', 'f', 'temperature')).toBeCloseTo(32)
  })

  it('100 °C = 212 °F', () => {
    expect(convert(100, 'c', 'f', 'temperature')).toBeCloseTo(212)
  })

  it('0 °C = 273.15 K', () => {
    expect(convert(0, 'c', 'k', 'temperature')).toBeCloseTo(273.15)
  })

  it('32 °F = 0 °C', () => {
    expect(convert(32, 'f', 'c', 'temperature')).toBeCloseTo(0)
  })

  it('273.15 K = 0 °C', () => {
    expect(convert(273.15, 'k', 'c', 'temperature')).toBeCloseTo(0)
  })

  it('absolute zero: -273.15 °C = 0 K', () => {
    expect(convert(-273.15, 'c', 'k', 'temperature')).toBeCloseTo(0)
  })

  it('identity: 25 °C = 25 °C', () => {
    expect(convert(25, 'c', 'c', 'temperature')).toBe(25)
  })

  it('negative: -40 °C = -40 °F', () => {
    expect(convert(-40, 'c', 'f', 'temperature')).toBeCloseTo(-40)
  })
})

describe('convert – volume', () => {
  it('1 l = 1000 ml', () => {
    expect(convert(1, 'l', 'ml', 'volume')).toBeCloseTo(1000)
  })

  it('1 cup ≈ 236.588 ml', () => {
    expect(convert(1, 'cup', 'ml', 'volume')).toBeCloseTo(236.588)
  })

  it('1 fl_oz ≈ 29.5735 ml', () => {
    expect(convert(1, 'fl_oz', 'ml', 'volume')).toBeCloseTo(29.5735)
  })

  it('identity: 2 l = 2 l', () => {
    expect(convert(2, 'l', 'l', 'volume')).toBe(2)
  })

  it('zero: 0 l = 0 ml', () => {
    expect(convert(0, 'l', 'ml', 'volume')).toBe(0)
  })
})
