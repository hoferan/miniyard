function capitalise(word: string): string {
  if (word.length === 0) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function tokenise(input: string): string[] {
  const chunks = input.match(/[\p{L}\p{N}]+/gu) ?? []
  const words: string[] = []
  for (const chunk of chunks) {
    const split = chunk
      .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
      .split(' ')
    words.push(...split)
  }
  return words
}

export function toUpperCase(input: string): string {
  return input.toUpperCase()
}

export function toLowerCase(input: string): string {
  return input.toLowerCase()
}

export function toSentenceCase(input: string): string {
  const lower = input.toLowerCase()
  const idx = lower.search(/\p{L}/u)
  if (idx === -1) return lower
  return lower.slice(0, idx) + lower.charAt(idx).toUpperCase() + lower.slice(idx + 1)
}

export function toTitleCase(words: string[]): string {
  return words.map((w) => capitalise(w.toLowerCase())).join(' ')
}

export function toCamelCase(words: string[]): string {
  if (words.length === 0) return ''
  const [first, ...rest] = words
  return first.toLowerCase() + rest.map((w) => capitalise(w.toLowerCase())).join('')
}

export function toPascalCase(words: string[]): string {
  return words.map((w) => capitalise(w.toLowerCase())).join('')
}

export function toSnakeCase(words: string[]): string {
  return words.map((w) => w.toLowerCase()).join('_')
}

export function toKebabCase(words: string[]): string {
  return words.map((w) => w.toLowerCase()).join('-')
}

export function toScreamingSnakeCase(words: string[]): string {
  return words.map((w) => w.toUpperCase()).join('_')
}

export type CaseConversions = {
  upperCase: string
  lowerCase: string
  titleCase: string
  sentenceCase: string
  camelCase: string
  pascalCase: string
  snakeCase: string
  kebabCase: string
  screamingSnakeCase: string
}

export function convertAllCases(input: string): CaseConversions {
  const trimmed = input.trim()
  const words = tokenise(input)
  return {
    upperCase: toUpperCase(trimmed),
    lowerCase: toLowerCase(trimmed),
    titleCase: toTitleCase(words),
    sentenceCase: toSentenceCase(trimmed),
    camelCase: toCamelCase(words),
    pascalCase: toPascalCase(words),
    snakeCase: toSnakeCase(words),
    kebabCase: toKebabCase(words),
    screamingSnakeCase: toScreamingSnakeCase(words),
  }
}
