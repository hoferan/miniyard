'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/copy-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DEFAULT_COLOR,
  formatHslaString,
  formatRgbaString,
  parseHexInput,
  parseHslInput,
  parseRgbInput,
  rgbaToHex,
  rgbaToHsla,
  type HslFieldsInput,
  type Rgba,
  type RgbFieldsInput,
} from './logic'
import { ARIA, ERROR_MESSAGES, UI } from './messages'

function toRgbFields(color: Rgba): RgbFieldsInput {
  return {
    r: String(color.r),
    g: String(color.g),
    b: String(color.b),
    a: String(Math.round(color.a * 100)),
  }
}

function toHslFields(color: Rgba): HslFieldsInput {
  const hsla = rgbaToHsla(color)
  return {
    h: String(hsla.h),
    s: String(hsla.s),
    l: String(hsla.l),
    a: String(Math.round(color.a * 100)),
  }
}

const CHECKERBOARD =
  'bg-[length:16px_16px] bg-[position:0_0,8px_8px] ' +
  'bg-[image:linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)]'

export default function ColorConverter() {
  const [color, setColor] = useState<Rgba>(DEFAULT_COLOR)
  const [hexInput, setHexInput] = useState(rgbaToHex(DEFAULT_COLOR))
  const [hexError, setHexError] = useState(false)
  const [rgbFields, setRgbFields] = useState<RgbFieldsInput>(toRgbFields(DEFAULT_COLOR))
  const [rgbError, setRgbError] = useState(false)
  const [hslFields, setHslFields] = useState<HslFieldsInput>(toHslFields(DEFAULT_COLOR))
  const [hslError, setHslError] = useState(false)

  function handleHexChange(value: string) {
    setHexInput(value)
    const result = parseHexInput(value)
    if (result.ok) {
      setColor(result.value)
      setHexError(false)
      setRgbFields(toRgbFields(result.value))
      setRgbError(false)
      setHslFields(toHslFields(result.value))
      setHslError(false)
    } else {
      setHexError(true)
    }
  }

  function handleRgbFieldChange(field: keyof RgbFieldsInput, value: string) {
    const next = { ...rgbFields, [field]: value }
    setRgbFields(next)
    const result = parseRgbInput(next)
    if (result.ok) {
      setColor(result.value)
      setRgbError(false)
      setHexInput(rgbaToHex(result.value))
      setHexError(false)
      setHslFields(toHslFields(result.value))
      setHslError(false)
    } else {
      setRgbError(true)
    }
  }

  function handleHslFieldChange(field: keyof HslFieldsInput, value: string) {
    const next = { ...hslFields, [field]: value }
    setHslFields(next)
    const result = parseHslInput(next)
    if (result.ok) {
      setColor(result.value)
      setHslError(false)
      setHexInput(rgbaToHex(result.value))
      setHexError(false)
      setRgbFields(toRgbFields(result.value))
      setRgbError(false)
    } else {
      setHslError(true)
    }
  }

  const rgbaString = formatRgbaString(color)
  const hslaString = formatHslaString(color)

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <div className={`relative h-24 w-full overflow-hidden rounded-lg border border-border ${CHECKERBOARD}`}>
        <div
          className="absolute inset-0"
          role="img"
          aria-label={ARIA.swatch}
          style={{ backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hex-input">{UI.hexLabel}</Label>
        <div className="flex gap-2">
          <Input
            id="hex-input"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder={UI.hexPlaceholder}
            aria-label={ARIA.hexInput}
            className="flex-1 min-w-0 font-mono"
            spellCheck={false}
          />
          <CopyButton value={hexInput} label={UI.copyHexLabel} className="shrink-0" />
        </div>
        {hexError && (
          <p className="text-sm text-destructive" role="alert">
            {ERROR_MESSAGES.INVALID_HEX}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>{UI.rgbLabel}</Label>
        <div className="grid grid-cols-4 gap-2">
          <Input
            type="number"
            value={rgbFields.r}
            onChange={(e) => handleRgbFieldChange('r', e.target.value)}
            aria-label={ARIA.rgbR}
            className="min-w-0"
          />
          <Input
            type="number"
            value={rgbFields.g}
            onChange={(e) => handleRgbFieldChange('g', e.target.value)}
            aria-label={ARIA.rgbG}
            className="min-w-0"
          />
          <Input
            type="number"
            value={rgbFields.b}
            onChange={(e) => handleRgbFieldChange('b', e.target.value)}
            aria-label={ARIA.rgbB}
            className="min-w-0"
          />
          <Input
            type="number"
            value={rgbFields.a}
            onChange={(e) => handleRgbFieldChange('a', e.target.value)}
            aria-label={ARIA.rgbAlpha}
            className="min-w-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 truncate text-sm text-muted-foreground">{rgbaString}</code>
          <CopyButton value={rgbaString} label={UI.copyRgbLabel} className="shrink-0" />
        </div>
        {rgbError && (
          <p className="text-sm text-destructive" role="alert">
            {ERROR_MESSAGES.INVALID_RGB}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>{UI.hslLabel}</Label>
        <div className="grid grid-cols-4 gap-2">
          <Input
            type="number"
            value={hslFields.h}
            onChange={(e) => handleHslFieldChange('h', e.target.value)}
            aria-label={ARIA.hslHue}
            className="min-w-0"
          />
          <Input
            type="number"
            value={hslFields.s}
            onChange={(e) => handleHslFieldChange('s', e.target.value)}
            aria-label={ARIA.hslSaturation}
            className="min-w-0"
          />
          <Input
            type="number"
            value={hslFields.l}
            onChange={(e) => handleHslFieldChange('l', e.target.value)}
            aria-label={ARIA.hslLightness}
            className="min-w-0"
          />
          <Input
            type="number"
            value={hslFields.a}
            onChange={(e) => handleHslFieldChange('a', e.target.value)}
            aria-label={ARIA.hslAlpha}
            className="min-w-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 truncate text-sm text-muted-foreground">{hslaString}</code>
          <CopyButton value={hslaString} label={UI.copyHslLabel} className="shrink-0" />
        </div>
        {hslError && (
          <p className="text-sm text-destructive" role="alert">
            {ERROR_MESSAGES.INVALID_HSL}
          </p>
        )}
      </div>
    </div>
  )
}
