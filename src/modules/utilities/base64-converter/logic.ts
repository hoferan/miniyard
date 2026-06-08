export type DecodeResult = { ok: true; value: string } | { ok: false; error: string }

const INVALID_BASE64_MESSAGE =
  'Invalid Base64 input: contains characters outside the Base64 alphabet or has incorrect padding.'
const INVALID_UTF8_MESSAGE = 'Invalid Base64 input: decoded bytes are not valid UTF-8 text.'

/** UTF-8 byte length of a string. */
export function byteLength(input: string): number {
  return new TextEncoder().encode(input).length
}

function isValidBase64(input: string): boolean {
  if (input.length % 4 !== 0) return false
  return /^[A-Za-z0-9+/]*={0,2}$/.test(input)
}

/** Encode a UTF-8 string to a Base64 string. */
export function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

/**
 * Decode a Base64 string back to a UTF-8 string.
 * Whitespace is stripped before decoding. Returns a discriminated union so the
 * caller can render errors without try/catch.
 */
export function decodeBase64(input: string): DecodeResult {
  const cleaned = input.replace(/\s/g, '')
  if (cleaned === '') return { ok: true, value: '' }

  if (!isValidBase64(cleaned)) {
    return { ok: false, error: INVALID_BASE64_MESSAGE }
  }

  let bytes: Uint8Array
  try {
    const binary = atob(cleaned)
    bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  } catch {
    return { ok: false, error: INVALID_BASE64_MESSAGE }
  }

  try {
    const value = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return { ok: true, value }
  } catch {
    return { ok: false, error: INVALID_UTF8_MESSAGE }
  }
}
