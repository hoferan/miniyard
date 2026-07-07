import type { FieldErrorCode } from './logic'

export const ERROR_MESSAGES: Record<FieldErrorCode, string> = {
  INVALID_HEX: 'Enter a valid hex color, e.g. #3b82f6 or #3b82f6cc.',
  INVALID_RGB: 'R, G, B must be whole numbers 0–255, and A must be 0–100%.',
  INVALID_HSL: 'H must be 0–360, and S, L, A must be 0–100%.',
}

export const UI = {
  hexLabel: 'HEX',
  rgbLabel: 'RGB',
  hslLabel: 'HSL',
  hexPlaceholder: '#3b82f6',
  copyHexLabel: 'Copy hex value',
  copyRgbLabel: 'Copy RGB value',
  copyHslLabel: 'Copy HSL value',
}

export const ARIA = {
  swatch: 'Live color preview',
  hexInput: 'Hex color value',
  rgbR: 'Red (0-255)',
  rgbG: 'Green (0-255)',
  rgbB: 'Blue (0-255)',
  rgbAlpha: 'RGB alpha percent (0-100)',
  hslHue: 'Hue (0-360)',
  hslSaturation: 'Saturation percent (0-100)',
  hslLightness: 'Lightness percent (0-100)',
  hslAlpha: 'HSL alpha percent (0-100)',
}
