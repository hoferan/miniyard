import type { Base64ErrorCode } from './logic'

export const ERROR_MESSAGES: Record<Base64ErrorCode, string> = {
  INVALID_BASE64:
    'Invalid Base64 input: contains characters outside the Base64 alphabet or has incorrect padding.',
  INVALID_UTF8: 'Invalid Base64 input: decoded bytes are not valid UTF-8 text.',
}

export const UI = {
  encode: 'Encode',
  decode: 'Decode',
  plainText: 'Plain text',
  base64Label: 'Base64',
  placeholderEncode: 'Type or paste text…',
  placeholderDecode: 'Paste a Base64 string…',
  outputPlaceholder: '—',
  charsBytesLabel: (chars: number, bytes: number) => `${chars} chars · ${bytes} bytes`,
}
