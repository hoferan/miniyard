import { describe, it, expect } from 'vitest'
import { encodeBase64, decodeBase64, byteLength } from './logic'

describe('encodeBase64', () => {
  it('encodes a simple ASCII string', () => {
    expect(encodeBase64('Hello')).toBe('SGVsbG8=')
  })

  it('encodes the empty string to an empty string', () => {
    expect(encodeBase64('')).toBe('')
  })

  it('encodes a string with spaces and punctuation', () => {
    expect(encodeBase64('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==')
  })

  it('encodes UTF-8 multibyte characters (accents)', () => {
    expect(encodeBase64('Héllo')).toBe('SMOpbGxv')
  })

  it('encodes emoji correctly', () => {
    expect(encodeBase64('👋')).toBe('8J+Riw==')
  })
})

describe('decodeBase64', () => {
  it('decodes a simple Base64 string', () => {
    expect(decodeBase64('SGVsbG8=')).toEqual({ ok: true, value: 'Hello' })
  })

  it('decodes the empty string to an empty string', () => {
    expect(decodeBase64('')).toEqual({ ok: true, value: '' })
  })

  it('decodes UTF-8 multibyte characters (accents)', () => {
    expect(decodeBase64('SMOpbGxv')).toEqual({ ok: true, value: 'Héllo' })
  })

  it('decodes emoji correctly', () => {
    expect(decodeBase64('8J+Riw==')).toEqual({ ok: true, value: '👋' })
  })

  it('strips surrounding whitespace before decoding', () => {
    expect(decodeBase64('  SGVsbG8=  ')).toEqual({ ok: true, value: 'Hello' })
  })

  it('strips internal line breaks before decoding', () => {
    expect(decodeBase64('SGVs\nbG8=')).toEqual({ ok: true, value: 'Hello' })
  })

  it('returns an error for characters outside the Base64 alphabet', () => {
    const result = decodeBase64('not base64!@#')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/invalid/i)
  })

  it('returns an error for incorrect padding / length', () => {
    const result = decodeBase64('SGVsbG8')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/invalid/i)
  })

  it('returns an error for valid Base64 that is not valid UTF-8', () => {
    // 0xFF is not a valid standalone UTF-8 byte
    const result = decodeBase64('/w==')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/invalid/i)
  })

  it('rejects padding characters in the middle of the string', () => {
    const result = decodeBase64('SG=sbG8=')
    expect(result.ok).toBe(false)
  })
})

describe('round-trip', () => {
  it('encode then decode returns the original string', () => {
    const inputs = ['', 'Hello', 'Héllo 👋', 'The quick brown fox', '{"key":"value"}']
    for (const input of inputs) {
      const encoded = encodeBase64(input)
      expect(decodeBase64(encoded)).toEqual({ ok: true, value: input })
    }
  })
})

describe('byteLength', () => {
  it('returns 0 for the empty string', () => {
    expect(byteLength('')).toBe(0)
  })

  it('counts ASCII characters as one byte each', () => {
    expect(byteLength('Hello')).toBe(5)
  })

  it('counts multibyte UTF-8 characters correctly', () => {
    // é is 2 bytes, so "Héllo" is 6 bytes
    expect(byteLength('Héllo')).toBe(6)
  })

  it('counts emoji as four bytes', () => {
    expect(byteLength('👋')).toBe(4)
  })
})
