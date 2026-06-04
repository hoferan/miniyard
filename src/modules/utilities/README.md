# Utilities

## What belongs here

Calculators, converters, text tools, and math functions — anything that takes user input and produces a transformed or calculated output without requiring external data.

## Examples

- BMI Calculator
- Unit Converter (length, weight, temperature, volume)
- Base64 Encoder / Decoder
- Colour Format Converter (HEX ↔ RGB ↔ HSL)
- Percentage Calculator
- Tip Calculator
- Readability Score
- Password Strength Checker

## What does NOT belong here

- Tools that require live external data → create a new category for that
- Interactive games → use `games/`

## Module structure

```
src/modules/utilities/<name>/
  meta.ts           # Metadata: slug, title, description, icon, tags, status
  logic.ts          # Pure functions — no side effects, no network calls
  logic.test.ts     # Vitest unit tests
  index.tsx         # React UI component ('use client' if interactive)
```

## Brainstorm questions (Claude asks these before writing any code)

1. What exactly should it calculate / convert / process?
2. What are the inputs? (types, units, validation rules)
3. What is the output? (number, text, formatted string?)
4. Is there a known formula or algorithm?
5. Edge cases: 0, negative values, empty input, invalid format?
6. Mobile interaction: slider, input field, instant calculation on change?

## Conventions

- All logic lives in `logic.ts` as pure functions — no React, no DOM, no network
- No external API calls — if data needs to be fetched, it belongs in a different category
- Every edge case from brainstorm must have a corresponding test
- Calculation results should be deterministic and testable
