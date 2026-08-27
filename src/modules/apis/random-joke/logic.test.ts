import { describe, it, expect } from 'vitest'
import {
  CATEGORIES,
  buildUpstreamPath,
  isTwoPart,
  isValidCategory,
  parseJoke,
  type Joke,
} from './logic'

const singlePayload = {
  error: false,
  category: 'Programming',
  type: 'single',
  joke: 'There are 10 types of people: those who understand binary and those who do not.',
  flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false },
  id: 7,
  safe: true,
  lang: 'en',
}

const twoPartPayload = {
  error: false,
  category: 'Programming',
  type: 'twopart',
  setup: 'Why do programmers prefer dark mode?',
  delivery: 'Because light attracts bugs.',
  flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false },
  id: 42,
  safe: true,
  lang: 'en',
}

describe('CATEGORIES', () => {
  it('exposes exactly the four categories from the issue', () => {
    expect(CATEGORIES).toEqual(['Any', 'Programming', 'Misc', 'Pun'])
  })
})

describe('isValidCategory', () => {
  it('accepts every listed category', () => {
    for (const category of CATEGORIES) {
      expect(isValidCategory(category)).toBe(true)
    }
  })

  it('rejects categories JokeAPI supports but this module does not expose', () => {
    expect(isValidCategory('Dark')).toBe(false)
    expect(isValidCategory('Spooky')).toBe(false)
  })

  it('rejects wrong casing, empty strings and non-strings', () => {
    expect(isValidCategory('programming')).toBe(false)
    expect(isValidCategory('')).toBe(false)
    expect(isValidCategory(null)).toBe(false)
    expect(isValidCategory(undefined)).toBe(false)
    expect(isValidCategory(7)).toBe(false)
  })

  it('rejects an attempt to smuggle extra query parameters through the category', () => {
    expect(isValidCategory('Any?blacklistFlags=nsfw')).toBe(false)
  })
})

describe('buildUpstreamPath', () => {
  it('builds a bare path when safe mode is off', () => {
    expect(buildUpstreamPath('Programming', false)).toBe('/joke/Programming')
  })

  it('appends the valueless safe-mode flag when safe mode is on', () => {
    expect(buildUpstreamPath('Programming', true)).toBe('/joke/Programming?safe-mode')
  })

  it('supports the Any category', () => {
    expect(buildUpstreamPath('Any', true)).toBe('/joke/Any?safe-mode')
  })

  it('returns a path only, never an absolute URL', () => {
    expect(buildUpstreamPath('Misc', true).startsWith('/joke/')).toBe(true)
  })
})

describe('parseJoke', () => {
  it('normalises a single joke', () => {
    expect(parseJoke(singlePayload)).toEqual({
      type: 'single',
      text: 'There are 10 types of people: those who understand binary and those who do not.',
      category: 'Programming',
    })
  })

  it('normalises a two-part joke', () => {
    expect(parseJoke(twoPartPayload)).toEqual({
      type: 'twopart',
      setup: 'Why do programmers prefer dark mode?',
      delivery: 'Because light attracts bugs.',
      category: 'Programming',
    })
  })

  it('throws noMatch when JokeAPI reports code 106 despite an HTTP 200', () => {
    expect(() =>
      parseJoke({
        error: true,
        internalError: false,
        code: 106,
        message: 'No matching joke found',
        causedBy: ['No jokes were found that match your provided filter(s).'],
      }),
    ).toThrow('noMatch')
  })

  it('throws upstream for any other error payload', () => {
    expect(() =>
      parseJoke({ error: true, internalError: true, code: 500, message: 'Internal Error' }),
    ).toThrow('upstream')
  })

  it('throws upstream for an unknown joke type', () => {
    expect(() => parseJoke({ error: false, type: 'limerick', joke: 'x' })).toThrow('upstream')
  })

  it('throws upstream when a single joke has no text', () => {
    expect(() => parseJoke({ error: false, type: 'single', category: 'Misc' })).toThrow('upstream')
  })

  it('throws upstream when a single joke has an empty text', () => {
    expect(() => parseJoke({ error: false, type: 'single', joke: '   ' })).toThrow('upstream')
  })

  it('throws upstream when a two-part joke is missing its delivery', () => {
    expect(() =>
      parseJoke({ error: false, type: 'twopart', setup: 'Knock knock', category: 'Misc' }),
    ).toThrow('upstream')
  })

  it('throws upstream when a two-part joke is missing its setup', () => {
    expect(() =>
      parseJoke({ error: false, type: 'twopart', delivery: 'A punchline', category: 'Misc' }),
    ).toThrow('upstream')
  })

  it.each([null, undefined, 'a string', 42, []])('throws upstream for %o', (raw) => {
    expect(() => parseJoke(raw)).toThrow('upstream')
  })

  it('defaults a missing category to an empty string rather than failing', () => {
    expect(parseJoke({ error: false, type: 'single', joke: 'Ha.' })).toEqual({
      type: 'single',
      text: 'Ha.',
      category: '',
    })
  })

  it('does not treat a joke whose text is the word "error" as an error payload', () => {
    expect(parseJoke({ error: false, type: 'single', joke: 'error', category: 'Misc' })).toEqual({
      type: 'single',
      text: 'error',
      category: 'Misc',
    })
  })
})

describe('isTwoPart', () => {
  it('is true for a two-part joke', () => {
    expect(isTwoPart(parseJoke(twoPartPayload))).toBe(true)
  })

  it('is false for a single joke', () => {
    expect(isTwoPart(parseJoke(singlePayload))).toBe(false)
  })

  it('narrows the type so the delivery is reachable', () => {
    const joke: Joke = parseJoke(twoPartPayload)
    expect(isTwoPart(joke) ? joke.delivery : null).toBe('Because light attracts bugs.')
  })
})
