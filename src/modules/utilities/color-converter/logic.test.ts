import { describe, it, expect } from 'vitest'
import {
  DEFAULT_COLOR,
  formatHslaString,
  formatRgbaString,
  hexToRgba,
  hslToRgb,
  hslaToRgba,
  parseHexInput,
  parseHslInput,
  parseRgbInput,
  rgbToHsl,
  rgbaToHex,
  rgbaToHsla,
} from './logic'

describe('DEFAULT_COLOR', () => {
  it('is a fully opaque blue', () => {
    expect(DEFAULT_COLOR).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })
})

describe('hexToRgba', () => {
  it('parses a 6-digit hex with #', () => {
    expect(hexToRgba('#3b82f6')).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })

  it('parses a 6-digit hex without #', () => {
    expect(hexToRgba('3b82f6')).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })

  it('is case-insensitive', () => {
    expect(hexToRgba('#3B82F6')).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })

  it('expands 3-digit shorthand', () => {
    expect(hexToRgba('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 })
  })

  it('expands 4-digit shorthand with alpha', () => {
    const result = hexToRgba('#abcd')
    expect(result?.r).toBe(170)
    expect(result?.g).toBe(187)
    expect(result?.b).toBe(204)
    expect(result?.a).toBeCloseTo(221 / 255, 5)
  })

  it('parses 8-digit hex with alpha', () => {
    const result = hexToRgba('#3b82f680')
    expect(result?.r).toBe(59)
    expect(result?.g).toBe(130)
    expect(result?.b).toBe(246)
    expect(result?.a).toBeCloseTo(128 / 255, 5)
  })

  it('returns null for an invalid length (5 digits)', () => {
    expect(hexToRgba('#abcde')).toBeNull()
  })

  it('returns null for an invalid length (7 digits)', () => {
    expect(hexToRgba('#abcdefa')).toBeNull()
  })

  it('returns null for non-hex characters', () => {
    expect(hexToRgba('#gggggg')).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(hexToRgba('')).toBeNull()
  })
})

describe('rgbaToHex', () => {
  it('outputs 6-digit hex when alpha is 1', () => {
    expect(rgbaToHex({ r: 59, g: 130, b: 246, a: 1 })).toBe('#3b82f6')
  })

  it('outputs 8-digit hex when alpha is less than 1', () => {
    expect(rgbaToHex({ r: 170, g: 187, b: 204, a: 221 / 255 })).toBe('#aabbccdd')
  })

  it('round-trips black', () => {
    expect(rgbaToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000')
  })

  it('round-trips white', () => {
    expect(rgbaToHex({ r: 255, g: 255, b: 255, a: 1 })).toBe('#ffffff')
  })
})

describe('rgbToHsl', () => {
  it('converts black', () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 })
  })

  it('converts white', () => {
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('converts pure red', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 })
  })

  it('converts pure green', () => {
    expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 })
  })

  it('converts pure blue', () => {
    expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 })
  })

  it('converts a gray to s=0', () => {
    expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 })
  })
})

describe('hslToRgb', () => {
  it('converts black', () => {
    expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('converts white', () => {
    expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('converts pure red', () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('converts pure green', () => {
    expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('converts pure blue', () => {
    expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('converts a 0-saturation hue to gray', () => {
    expect(hslToRgb(0, 0, 50)).toEqual({ r: 128, g: 128, b: 128 })
  })

  it('treats H=360 the same as H=0', () => {
    expect(hslToRgb(360, 100, 50)).toEqual(hslToRgb(0, 100, 50))
  })
})

describe('rgbaToHsla / hslaToRgba', () => {
  it('carries alpha through rgbaToHsla', () => {
    expect(rgbaToHsla({ r: 255, g: 0, b: 0, a: 0.5 })).toEqual({ h: 0, s: 100, l: 50, a: 0.5 })
  })

  it('carries alpha through hslaToRgba', () => {
    expect(hslaToRgba({ h: 0, s: 100, l: 50, a: 0.5 })).toEqual({ r: 255, g: 0, b: 0, a: 0.5 })
  })
})

describe('parseHexInput', () => {
  it('accepts a valid hex value', () => {
    const result = parseHexInput('#3b82f6')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toEqual({ r: 59, g: 130, b: 246, a: 1 })
  })

  it('rejects an invalid hex value', () => {
    const result = parseHexInput('not-a-color')
    expect(result).toEqual({ ok: false, error: 'INVALID_HEX' })
  })
})

describe('parseRgbInput', () => {
  it('accepts valid values', () => {
    const result = parseRgbInput({ r: '59', g: '130', b: '246', a: '100' })
    expect(result).toEqual({ ok: true, value: { r: 59, g: 130, b: 246, a: 1 } })
  })

  it('accepts a fractional alpha percent', () => {
    const result = parseRgbInput({ r: '0', g: '0', b: '0', a: '50' })
    expect(result).toEqual({ ok: true, value: { r: 0, g: 0, b: 0, a: 0.5 } })
  })

  it('rejects R above 255', () => {
    const result = parseRgbInput({ r: '300', g: '0', b: '0', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_RGB' })
  })

  it('rejects a negative value', () => {
    const result = parseRgbInput({ r: '-5', g: '0', b: '0', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_RGB' })
  })

  it('rejects a non-integer R/G/B value', () => {
    const result = parseRgbInput({ r: '25.5', g: '0', b: '0', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_RGB' })
  })

  it('rejects an empty field', () => {
    const result = parseRgbInput({ r: '', g: '0', b: '0', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_RGB' })
  })

  it('rejects alpha above 100', () => {
    const result = parseRgbInput({ r: '0', g: '0', b: '0', a: '101' })
    expect(result).toEqual({ ok: false, error: 'INVALID_RGB' })
  })
})

describe('parseHslInput', () => {
  it('accepts valid values and converts to RGBA', () => {
    const result = parseHslInput({ h: '0', s: '100', l: '50', a: '100' })
    expect(result).toEqual({ ok: true, value: { r: 255, g: 0, b: 0, a: 1 } })
  })

  it('accepts H=360 as the boundary', () => {
    const result = parseHslInput({ h: '360', s: '100', l: '50', a: '100' })
    expect(result.ok).toBe(true)
  })

  it('rejects H above 360', () => {
    const result = parseHslInput({ h: '361', s: '100', l: '50', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_HSL' })
  })

  it('rejects S above 100', () => {
    const result = parseHslInput({ h: '0', s: '101', l: '50', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_HSL' })
  })

  it('rejects a non-numeric field', () => {
    const result = parseHslInput({ h: 'abc', s: '100', l: '50', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_HSL' })
  })

  it('rejects an empty field', () => {
    const result = parseHslInput({ h: '0', s: '', l: '50', a: '100' })
    expect(result).toEqual({ ok: false, error: 'INVALID_HSL' })
  })
})

describe('formatRgbaString', () => {
  it('formats an opaque color', () => {
    expect(formatRgbaString({ r: 59, g: 130, b: 246, a: 1 })).toBe('rgba(59, 130, 246, 1)')
  })

  it('formats a half-transparent color without floating point noise', () => {
    expect(formatRgbaString({ r: 0, g: 0, b: 0, a: 0.5 })).toBe('rgba(0, 0, 0, 0.5)')
  })

  it('formats a fully transparent color', () => {
    expect(formatRgbaString({ r: 0, g: 0, b: 0, a: 0 })).toBe('rgba(0, 0, 0, 0)')
  })
})

describe('formatHslaString', () => {
  it('formats an opaque red', () => {
    expect(formatHslaString({ r: 255, g: 0, b: 0, a: 1 })).toBe('hsla(0, 100%, 50%, 1)')
  })

  it('formats a half-transparent color', () => {
    expect(formatHslaString({ r: 255, g: 0, b: 0, a: 0.5 })).toBe('hsla(0, 100%, 50%, 0.5)')
  })
})

describe('round trip: HEX -> RGBA -> HSLA -> RGBA', () => {
  it('stays within rounding tolerance for an arbitrary color', () => {
    // HSL fields are rounded to whole degrees/percent for display, so a round trip
    // through HSL can drift by a channel or two — this is expected, not a bug.
    const original = hexToRgba('#3b82f6')
    expect(original).not.toBeNull()
    if (!original) return
    const hsla = rgbaToHsla(original)
    const backToRgba = hslaToRgba(hsla)
    expect(Math.abs(backToRgba.r - original.r)).toBeLessThanOrEqual(2)
    expect(Math.abs(backToRgba.g - original.g)).toBeLessThanOrEqual(2)
    expect(Math.abs(backToRgba.b - original.b)).toBeLessThanOrEqual(2)
  })

  it('is exact for pure hues with no rounding loss', () => {
    const original = hexToRgba('#ff0000')
    expect(original).not.toBeNull()
    if (!original) return
    const hsla = rgbaToHsla(original)
    const backToRgba = hslaToRgba(hsla)
    expect(rgbaToHex(backToRgba)).toBe('#ff0000')
  })
})
