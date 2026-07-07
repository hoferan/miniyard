export type Rgba = { r: number; g: number; b: number; a: number }
export type Hsla = { h: number; s: number; l: number; a: number }
export type RgbFieldsInput = { r: string; g: string; b: string; a: string }
export type HslFieldsInput = { h: string; s: string; l: string; a: string }
export type FieldErrorCode = 'INVALID_HEX' | 'INVALID_RGB' | 'INVALID_HSL'
export type ParseResult = { ok: true; value: Rgba } | { ok: false; error: FieldErrorCode }

export const DEFAULT_COLOR: Rgba = { r: 59, g: 130, b: 246, a: 1 }

/** Parses a HEX string (3/4/6/8 digits, with or without leading '#') into RGBA, or null if invalid. */
export function hexToRgba(input: string): Rgba | null {
  const hex = input.trim().replace(/^#/, '')
  if (hex.length === 0 || !/^[0-9a-fA-F]+$/.test(hex)) return null

  let expanded: string
  if (hex.length === 3) {
    expanded = hex.split('').map((c) => c + c).join('') + 'ff'
  } else if (hex.length === 4) {
    expanded = hex.split('').map((c) => c + c).join('')
  } else if (hex.length === 6) {
    expanded = hex + 'ff'
  } else if (hex.length === 8) {
    expanded = hex
  } else {
    return null
  }

  const r = parseInt(expanded.slice(0, 2), 16)
  const g = parseInt(expanded.slice(2, 4), 16)
  const b = parseInt(expanded.slice(4, 6), 16)
  const aByte = parseInt(expanded.slice(6, 8), 16)

  return { r, g, b, a: aByte / 255 }
}

/** Formats RGBA as 6-digit hex (alpha 1) or 8-digit hex (alpha < 1). */
export function rgbaToHex(rgba: Rgba): string {
  const toHexByte = (n: number) => n.toString(16).padStart(2, '0')
  const alphaByte = Math.round(rgba.a * 255)
  const base = `#${toHexByte(rgba.r)}${toHexByte(rgba.g)}${toHexByte(rgba.b)}`
  return alphaByte === 255 ? base : `${base}${toHexByte(alphaByte)}`
}

/** Standard RGB -> HSL conversion. h in degrees (0-360), s/l in percent (0-100), all rounded. */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) }
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h: number
  switch (max) {
    case rNorm:
      h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
      break
    case gNorm:
      h = (bNorm - rNorm) / d + 2
      break
    default:
      h = (rNorm - gNorm) / d + 4
  }
  h *= 60

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hueToRgb(p: number, q: number, t: number): number {
  let tt = t
  if (tt < 0) tt += 1
  if (tt > 1) tt -= 1
  if (tt < 1 / 6) return p + (q - p) * 6 * tt
  if (tt < 1 / 2) return q
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
  return p
}

/** Standard HSL -> RGB conversion via hue-sector helper. h in degrees, s/l in percent (0-100). */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hNorm = (((h % 360) + 360) % 360) / 360
  const sNorm = s / 100
  const lNorm = l / 100

  if (sNorm === 0) {
    const gray = Math.round(lNorm * 255)
    return { r: gray, g: gray, b: gray }
  }

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
  const p = 2 * lNorm - q

  const r = hueToRgb(p, q, hNorm + 1 / 3)
  const g = hueToRgb(p, q, hNorm)
  const b = hueToRgb(p, q, hNorm - 1 / 3)

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

export function rgbaToHsla(rgba: Rgba): Hsla {
  const { h, s, l } = rgbToHsl(rgba.r, rgba.g, rgba.b)
  return { h, s, l, a: rgba.a }
}

export function hslaToRgba(hsla: Hsla): Rgba {
  const { r, g, b } = hslToRgb(hsla.h, hsla.s, hsla.l)
  return { r, g, b, a: hsla.a }
}

export function parseHexInput(input: string): ParseResult {
  const rgba = hexToRgba(input)
  if (!rgba) return { ok: false, error: 'INVALID_HEX' }
  return { ok: true, value: rgba }
}

function parseIntStrict(value: string): number | null {
  if (!/^-?\d+$/.test(value.trim())) return null
  return parseInt(value, 10)
}

function parseNumStrict(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '' || Number.isNaN(Number(trimmed))) return null
  return Number(trimmed)
}

export function parseRgbInput(input: RgbFieldsInput): ParseResult {
  const r = parseIntStrict(input.r)
  const g = parseIntStrict(input.g)
  const b = parseIntStrict(input.b)
  const aPercent = parseNumStrict(input.a)

  if (
    r === null || g === null || b === null || aPercent === null ||
    r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 ||
    aPercent < 0 || aPercent > 100
  ) {
    return { ok: false, error: 'INVALID_RGB' }
  }

  return { ok: true, value: { r, g, b, a: aPercent / 100 } }
}

export function parseHslInput(input: HslFieldsInput): ParseResult {
  const h = parseNumStrict(input.h)
  const s = parseNumStrict(input.s)
  const l = parseNumStrict(input.l)
  const aPercent = parseNumStrict(input.a)

  if (
    h === null || s === null || l === null || aPercent === null ||
    h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100 ||
    aPercent < 0 || aPercent > 100
  ) {
    return { ok: false, error: 'INVALID_HSL' }
  }

  const { r, g, b } = hslToRgb(h, s, l)
  return { ok: true, value: { r, g, b, a: aPercent / 100 } }
}

function formatAlpha(a: number): string {
  return Number(a.toFixed(2)).toString()
}

export function formatRgbaString(rgba: Rgba): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${formatAlpha(rgba.a)})`
}

export function formatHslaString(rgba: Rgba): string {
  const hsla = rgbaToHsla(rgba)
  return `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${formatAlpha(hsla.a)})`
}
