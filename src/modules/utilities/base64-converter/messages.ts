import type { Base64ErrorCode } from './logic'

export const ERROR_MESSAGES: Record<Base64ErrorCode, string> = {
  INVALID_BASE64:
    'Invalid Base64 input: contains characters outside the Base64 alphabet or has incorrect padding.',
  INVALID_UTF8: 'Invalid Base64 input: decoded bytes are not valid UTF-8 text.',
}
