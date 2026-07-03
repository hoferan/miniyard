import { describe, it, expect } from 'vitest'
import {
  tokenise,
  toUpperCase,
  toLowerCase,
  toSentenceCase,
  toTitleCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toScreamingSnakeCase,
  convertAllCases,
} from './logic'

describe('tokenise', () => {
  it('splits whitespace-separated words', () => {
    expect(tokenise('hello world example')).toEqual(['hello', 'world', 'example'])
  })

  it('splits punctuation-separated words', () => {
    expect(tokenise('hello, world! example.')).toEqual(['hello', 'world', 'example'])
  })

  it('splits camelCase boundaries', () => {
    expect(tokenise('helloWorldExample')).toEqual(['hello', 'World', 'Example'])
  })

  it('splits PascalCase boundaries', () => {
    expect(tokenise('HelloWorldExample')).toEqual(['Hello', 'World', 'Example'])
  })

  it('keeps a standalone acronym as one word', () => {
    expect(tokenise('HTML')).toEqual(['HTML'])
  })

  it('splits an acronym run followed by a capitalised word', () => {
    expect(tokenise('parseHTMLString')).toEqual(['parse', 'HTML', 'String'])
  })

  it('splits a leading acronym run', () => {
    expect(tokenise('XMLHttpRequest')).toEqual(['XML', 'Http', 'Request'])
  })

  it('keeps digits attached to the preceding letters', () => {
    expect(tokenise('version2Update')).toEqual(['version2', 'Update'])
    expect(tokenise('item99Name')).toEqual(['item99', 'Name'])
  })

  it('treats a digits-only chunk as one word', () => {
    expect(tokenise('123')).toEqual(['123'])
  })

  it('returns an empty array for an empty string', () => {
    expect(tokenise('')).toEqual([])
  })

  it('returns an empty array for a whitespace-only string', () => {
    expect(tokenise('   ')).toEqual([])
  })

  it('splits on mixed separators consistently', () => {
    expect(tokenise('foo_bar-baz qux')).toEqual(['foo', 'bar', 'baz', 'qux'])
  })

  it('strips leading and trailing separators without producing empty words', () => {
    expect(tokenise('  -_foo bar_-  ')).toEqual(['foo', 'bar'])
  })

  it('treats non-ASCII letters as ordinary letters, not boundaries', () => {
    expect(tokenise('café bar')).toEqual(['café', 'bar'])
  })
})

describe('toUpperCase', () => {
  it('uppercases the whole string', () => {
    expect(toUpperCase('Hello World')).toBe('HELLO WORLD')
  })

  it('returns an empty string for empty input', () => {
    expect(toUpperCase('')).toBe('')
  })
})

describe('toLowerCase', () => {
  it('lowercases the whole string', () => {
    expect(toLowerCase('Hello World')).toBe('hello world')
  })

  it('returns an empty string for empty input', () => {
    expect(toLowerCase('')).toBe('')
  })
})

describe('toSentenceCase', () => {
  it('capitalises only the first letter of a lowercase sentence', () => {
    expect(toSentenceCase('hello world example')).toBe('Hello world example')
  })

  it('lowercases everything else regardless of original casing', () => {
    expect(toSentenceCase('HELLO WORLD')).toBe('Hello world')
  })

  it('returns an empty string for empty input', () => {
    expect(toSentenceCase('')).toBe('')
  })

  it('leaves a string with no letters unchanged', () => {
    expect(toSentenceCase('123 456')).toBe('123 456')
  })
})

describe('toTitleCase', () => {
  it('capitalises each word', () => {
    expect(toTitleCase(['hello', 'World', 'EXAMPLE'])).toBe('Hello World Example')
  })

  it('handles a single word', () => {
    expect(toTitleCase(['hello'])).toBe('Hello')
  })

  it('returns an empty string for no words', () => {
    expect(toTitleCase([])).toBe('')
  })
})

describe('toCamelCase', () => {
  it('lowercases the first word and capitalises the rest', () => {
    expect(toCamelCase(['hello', 'World', 'EXAMPLE'])).toBe('helloWorldExample')
  })

  it('handles a single word', () => {
    expect(toCamelCase(['Hello'])).toBe('hello')
  })

  it('returns an empty string for no words', () => {
    expect(toCamelCase([])).toBe('')
  })
})

describe('toPascalCase', () => {
  it('capitalises every word with no separator', () => {
    expect(toPascalCase(['hello', 'World', 'EXAMPLE'])).toBe('HelloWorldExample')
  })

  it('handles a single word', () => {
    expect(toPascalCase(['hello'])).toBe('Hello')
  })

  it('returns an empty string for no words', () => {
    expect(toPascalCase([])).toBe('')
  })
})

describe('toSnakeCase', () => {
  it('lowercases and joins with underscores', () => {
    expect(toSnakeCase(['Hello', 'World', 'EXAMPLE'])).toBe('hello_world_example')
  })

  it('handles a single word', () => {
    expect(toSnakeCase(['Hello'])).toBe('hello')
  })

  it('returns an empty string for no words', () => {
    expect(toSnakeCase([])).toBe('')
  })
})

describe('toKebabCase', () => {
  it('lowercases and joins with hyphens', () => {
    expect(toKebabCase(['Hello', 'World', 'EXAMPLE'])).toBe('hello-world-example')
  })

  it('handles a single word', () => {
    expect(toKebabCase(['Hello'])).toBe('hello')
  })

  it('returns an empty string for no words', () => {
    expect(toKebabCase([])).toBe('')
  })
})

describe('toScreamingSnakeCase', () => {
  it('uppercases and joins with underscores', () => {
    expect(toScreamingSnakeCase(['Hello', 'World', 'EXAMPLE'])).toBe('HELLO_WORLD_EXAMPLE')
  })

  it('handles a single word', () => {
    expect(toScreamingSnakeCase(['hello'])).toBe('HELLO')
  })

  it('returns an empty string for no words', () => {
    expect(toScreamingSnakeCase([])).toBe('')
  })
})

describe('convertAllCases', () => {
  it('computes all 9 formats for a representative mixed-case input', () => {
    expect(convertAllCases('Hello World Example')).toEqual({
      upperCase: 'HELLO WORLD EXAMPLE',
      lowerCase: 'hello world example',
      titleCase: 'Hello World Example',
      sentenceCase: 'Hello world example',
      camelCase: 'helloWorldExample',
      pascalCase: 'HelloWorldExample',
      snakeCase: 'hello_world_example',
      kebabCase: 'hello-world-example',
      screamingSnakeCase: 'HELLO_WORLD_EXAMPLE',
    })
  })

  it('computes all 9 formats for an already-cased identifier', () => {
    expect(convertAllCases('parseHTMLString')).toEqual({
      upperCase: 'PARSEHTMLSTRING',
      lowerCase: 'parsehtmlstring',
      titleCase: 'Parse Html String',
      sentenceCase: 'Parsehtmlstring',
      camelCase: 'parseHtmlString',
      pascalCase: 'ParseHtmlString',
      snakeCase: 'parse_html_string',
      kebabCase: 'parse-html-string',
      screamingSnakeCase: 'PARSE_HTML_STRING',
    })
  })

  it('returns all empty strings for empty input', () => {
    expect(convertAllCases('')).toEqual({
      upperCase: '',
      lowerCase: '',
      titleCase: '',
      sentenceCase: '',
      camelCase: '',
      pascalCase: '',
      snakeCase: '',
      kebabCase: '',
      screamingSnakeCase: '',
    })
  })

  it('returns all empty strings for whitespace-only input', () => {
    expect(convertAllCases('   ')).toEqual({
      upperCase: '',
      lowerCase: '',
      titleCase: '',
      sentenceCase: '',
      camelCase: '',
      pascalCase: '',
      snakeCase: '',
      kebabCase: '',
      screamingSnakeCase: '',
    })
  })
})
