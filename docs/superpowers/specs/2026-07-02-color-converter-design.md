# Spec: Color Converter

**Category:** utilities
**Date:** 2026-07-02
**Issue:** #72

## Function

Convert colors between HEX, RGB, and HSL formats (including alpha/transparency) with a live color swatch preview. Editing any field recalculates and updates the other two formats in real time. Each format has a copy button for its formatted value.

---

## Inputs

| Input | Type | Validation |
|---|---|---|
| HEX field | `string` | 3, 4, 6, or 8 hex digits, with or without leading `#`, case-insensitive. 3-digit expands to 6 (`#abc` → `#aabbcc`), 4-digit expands to 8 (`#abcd` → `#aabbccdd`, includes alpha). Anything else is invalid. |
| RGB fields | R, G, B: `number` (integer 0–255); A: `number` (0–100, %) | Out-of-range or non-integer (for R/G/B) values are invalid. |
| HSL fields | H: `number` (0–360); S, L: `number` (0–100, %); A: `number` (0–100, %) | Out-of-range values are invalid. |

Editing any field with a value that parses successfully replaces the canonical color; the other two format sections re-render from it. A field that fails to parse shows an inline error under its own section and does **not** change the canonical color or the swatch.

---

## Outputs

| Output | Description |
|---|---|
| Live swatch | Large color block reflecting the current canonical color. Renders over a checkerboard background so alpha < 100% is visible. |
| HEX value | 6-digit hex when alpha is 100%, 8-digit (`#RRGGBBAA`) otherwise. |
| RGB value | `rgba(r, g, b, a)` formatted string (a as 0–1 decimal, per CSS convention), plus the 4 editable number inputs. |
| HSL value | `hsla(h, s%, l%, a)` formatted string, plus the 4 editable number inputs. |
| Copy buttons | One per format, copies the formatted string (reuses existing `CopyButton` component). |
| Inline error | Per-section validation message (`role="alert"`) when that section's current input doesn't parse. |

---

## Logic / Algorithm

Canonical state is a single RGBA value: `{ r, g, b, a }` — r/g/b integers 0–255, a float 0–1. HEX and HSL are derived display values, not independent state.

```text
hexToRgba(hex) → Rgba | null
  - strip optional leading '#'
  - accept lengths 3, 4, 6, 8
  - 3 → expand each digit (e.g. 'a' → 'aa'), alpha = 1
  - 4 → expand each digit including alpha digit
  - 6 → parse as-is, alpha = 1
  - 8 → parse as-is, alpha = last byte / 255
  - any other length, or non-hex characters → null

rgbaToHex(rgba) → string
  - '#' + 2-digit hex for r, g, b
  - + 2-digit hex for round(a * 255) appended only when a < 1

rgbToHsl(r, g, b) → { h, s, l }
  - standard min/max normalisation formula (r,g,b normalised to 0–1)
  - h in degrees (0–360, rounded), s/l in % (0–100, rounded)

hslToRgb(h, s, l) → { r, g, b }
  - standard hue-sector conversion helper
  - r/g/b rounded to nearest integer 0–255

parseRgbInput({r,g,b,a}) → Rgba | FieldError
  - validates each of r,g,b as integer 0–255, a as 0–100 (%, converted to 0–1)

parseHslInput({h,s,l,a}) → Rgba | FieldError
  - validates h as 0–360, s/l as 0–100 (%), a as 0–100 (%)
  - on success, converts to RGBA via hslToRgb

formatRgbaString(rgba) → 'rgba(r, g, b, a)'
formatHslaString(rgba) → 'hsla(h, s%, l%, a)'  (derived via rgbToHsl)
```

All functions above are pure, live in `logic.ts`, take/return plain data — no React, no DOM.

---

## Edge Cases

| Case | Behaviour |
|---|---|
| HEX without `#` (e.g. `1a2b3c`) | Valid, treated same as `#1a2b3c` |
| 3-digit shorthand (`#abc`) | Expands to `#aabbcc`, alpha 100% |
| 4-digit shorthand with alpha (`#abcd`) | Expands to `#aabbccdd` |
| Invalid hex length (e.g. 5 or 7 digits) | Invalid — inline error, canonical color unchanged |
| Non-hex characters (e.g. `#gggggg`) | Invalid — inline error |
| RGB value out of range (e.g. R = 300 or R = -5) | Invalid — inline error on RGB section only |
| HSL H = 360 | Valid, equivalent to H = 0 |
| S = 0 (grayscale) | Valid; HEX/RGB show equal r=g=b regardless of H |
| L = 0 or L = 100 | Valid; pure black / white, H and S become visually irrelevant but retain entered values in the HSL fields |
| Alpha = 0 | Valid; swatch fully transparent (checkerboard fully visible) |
| Empty field | Treated as invalid (inline error), not as 0 |
| Editing one field while another section already shows an error | Each section's error is independent; a valid edit in one section doesn't clear an unrelated invalid entry sitting in another section's inputs until that section is itself edited to a valid value |

---

## Default State

On load: `{ r: 59, g: 130, b: 246, a: 1 }` (`#3b82f6`, a pleasant blue) — all three sections populated, swatch visible immediately.

---

## New Files

```text
src/modules/utilities/color-converter/meta.ts
src/modules/utilities/color-converter/logic.ts
src/modules/utilities/color-converter/logic.test.ts
src/modules/utilities/color-converter/messages.ts
src/modules/utilities/color-converter/index.tsx
tests/e2e/color-converter.spec.ts
```

### Registration

```text
src/lib/registry.ts                              — import + add colorConverterMeta
src/components/utilities-module-content.tsx      — add 'color-converter' to componentMap
src/lib/icons.ts                                 — add 'pipette' (lucide-react Pipette icon)
```

---

## UI Layout (mobile-first, stacked)

1. Swatch at top — large rounded block, checkerboard background beneath it for transparency.
2. HEX section — one text input + copy button + inline error slot.
3. RGB section — 4 number inputs (R, G, B, A%) + copy button (copies formatted `rgba(...)` string) + inline error slot.
4. HSL section — 4 number inputs (H, S%, L%, A%) + copy button (copies formatted `hsla(...)` string) + inline error slot.
5. No submit button — every valid edit updates immediately, consistent with `unit-converter` and `base64-converter`.

---

## Testing

### Unit tests (`logic.test.ts`)

- `hexToRgba`: 3/4/6/8-digit, with/without `#`, uppercase/lowercase, invalid lengths, invalid characters
- `rgbaToHex`: round-trips back to 6-digit when a=1, 8-digit when a<1
- `rgbToHsl` / `hslToRgb`: round-trip for known fixed points (black, white, red, green, blue, gray/S=0), boundary values (H=0, H=360, S=0, S=100, L=0, L=100)
- `parseRgbInput` / `parseHslInput`: valid values accepted, out-of-range and non-numeric values rejected per field
- `formatRgbaString` / `formatHslaString`: correct string output including alpha
- Full round-trip: HEX → RGBA → HSL → RGBA → HEX stays consistent (within rounding tolerance)

### E2E (`tests/e2e/color-converter.spec.ts`)

- Navigate to `/utilities/color-converter`
- Assert default swatch color and all three sections populated
- Edit HEX field → assert RGB and HSL fields update
- Edit an RGB field → assert HEX and HSL update, swatch color changes
- Enter invalid input in one field → assert inline error appears, swatch unchanged
- Click a copy button → assert copied state (button icon/label change)
- `page.screenshot()` for visual artifact
