# Spec: Text Case Converter

**Category:** utilities
**Date:** 2026-07-03
**Issue:** #71

## Function

Convert arbitrary text into 9 common casing styles simultaneously — UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and SCREAMING_SNAKE_CASE — updating live as the user types, with a copy button per output row.

---

## Inputs

| Input | Type | Validation |
|---|---|---|
| Text input | `string` (textarea) | No validation — any string including empty is accepted. Empty/whitespace-only input produces empty output for every row. |

---

## Outputs

| Output | Description |
|---|---|
| 9 output rows | One per format: UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE. Each row shows a label, a readonly text value, and a copy button (reuses existing `CopyButton` component). |

---

## Logic / Algorithm

All logic lives in `logic.ts` as pure functions — no React, no DOM.

```text
tokenise(input) → string[]
  1. Split input on whitespace and non-alphanumeric separator characters
     (anything that isn't a letter or digit — this includes '-', '_', punctuation).
  2. Within each alphanumeric chunk, split camelCase/PascalCase boundaries:
     - a lowercase→uppercase transition starts a new word
       (e.g. "parseHTML" → "parse" | "HTML")
     - a run of 2+ uppercase letters followed by a lowercase letter treats the
       last uppercase letter as the start of the next word
       (e.g. "HTMLString" → "HTML" | "String", "parseHTMLString" → "parse" | "HTML" | "String")
  3. Digits attach to whichever adjacent letter-run they touch; they do not
     force a new word boundary on their own
     (e.g. "version2Update" → "version2" | "Update").
  4. Empty or whitespace-only input → returns [].

capitalise(word) → string
  - uppercase first character, keep the rest as-is (lowercased separately per format as needed)

toUpperCase(input) → input.toUpperCase()
toLowerCase(input) → input.toLowerCase()
toSentenceCase(input) → lowercase the whole string, then uppercase the first alphabetic character
toTitleCase(words) → words.map(w => capitalise(w.toLowerCase())).join(' ')
toCamelCase(words) → first word lowercased, remaining words capitalised (lowercased first), joined with ''
toPascalCase(words) → every word capitalised (lowercased first), joined with ''
toSnakeCase(words) → words.map(w => w.toLowerCase()).join('_')
toKebabCase(words) → words.map(w => w.toLowerCase()).join('-')
toScreamingSnakeCase(words) → words.map(w => w.toUpperCase()).join('_')

convertAllCases(input) → { upperCase, lowerCase, titleCase, sentenceCase, camelCase, pascalCase, snakeCase, kebabCase, screamingSnakeCase }
  - computes all 9 outputs from a single tokenise() call (shared for the word-based formats)
  - upperCase/lowerCase/sentenceCase operate on the raw input string, not the tokenised words
```

---

## Edge Cases

| Case | Behaviour |
|---|---|
| Empty input | All 9 outputs are `''` |
| Whitespace-only input | Same as empty — all 9 outputs are `''` |
| Single word, already lowercase (e.g. `"hello"`) | No boundaries found; word-based formats just apply casing/separator rules to the one word |
| All-caps acronym alone (e.g. `"HTML"`) | Treated as one word — snake_case: `html`, PascalCase: `Html`, camelCase: `html` |
| Acronym inside a longer identifier (e.g. `"parseHTMLString"`) | Tokenised as `parse`, `HTML`, `String` per the camel/pascal boundary rule above |
| Mixed separators (e.g. `"foo_bar-baz qux"`) | All separators split words the same way: `foo`, `bar`, `baz`, `qux` |
| Leading/trailing punctuation or whitespace | Stripped as separators; does not produce empty leading/trailing words |
| Digits adjacent to letters (e.g. `"item99Name"`) | Digits stay attached to the preceding letter-run: `item99`, `Name` |
| Digits-only input (e.g. `"123"`) | Treated as one word; case-changing formats are no-ops on digits, separators still apply where relevant |
| Non-ASCII letters (e.g. `"café"`) | Treated as ordinary letters for casing purposes (via `toUpperCase()`/`toLowerCase()`); not used as boundary signals themselves |
| Already-cased input re-converted (e.g. input is already `snake_case`) | Underscore is treated as a separator like any other, producing the same tokenisation as space-separated input |

---

## Default State

On load: input textarea is empty, all 9 output rows render empty with disabled copy buttons — consistent with `base64-converter`'s empty-input behaviour.

---

## New Files

```text
src/modules/utilities/text-case-converter/meta.ts
src/modules/utilities/text-case-converter/logic.ts
src/modules/utilities/text-case-converter/logic.test.ts
src/modules/utilities/text-case-converter/index.tsx
tests/e2e/text-case-converter.spec.ts
```

No `messages.ts` — the module has no error/status copy, only static row labels defined inline in `index.tsx`.

### Registration

```text
src/lib/registry.ts                              — import + add textCaseConverterMeta
src/components/utilities-module-content.tsx      — add 'text-case-converter' to componentMap
src/lib/icons.ts                                 — add 'case-sensitive' (lucide-react CaseSensitive icon)
```

---

## UI Layout (mobile-first, stacked)

1. Single textarea input at top, live update on every keystroke — no submit button, matching `base64-converter` and `color-converter`.
2. Below it, 9 stacked rows in a fixed order (UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE): label + readonly text value + `CopyButton`.
3. Copy button is disabled when its row's value is empty (existing `CopyButton` behaviour via the `disabled={!value}` check).

---

## Testing

### Unit tests (`logic.test.ts`)

- `tokenise`: whitespace-separated, punctuation-separated, camelCase, PascalCase, acronym runs, digits attached, empty string, whitespace-only string, mixed separators, leading/trailing separators
- Each `to*Case` function: known fixed inputs → expected output, including single-word input and multi-word input
- `convertAllCases`: full snapshot of all 9 outputs for a representative multi-word mixed-case input, and for empty input (all `''`)

### E2E (`tests/e2e/text-case-converter.spec.ts`)

- Navigate to `/utilities/text-case-converter`
- Assert all 9 rows render empty by default with disabled copy buttons
- Type a sample string (e.g. `"Hello World Example"`) → assert all 9 rows show correct converted values
- Click a copy button → assert copied-state feedback (icon change)
- `page.screenshot()` for visual artifact
