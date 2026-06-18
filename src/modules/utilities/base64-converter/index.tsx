'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CopyButton } from '@/components/copy-button'
import { encodeBase64, decodeBase64, byteLength, type Base64ErrorCode } from './logic'
import { ERROR_MESSAGES } from './messages'

type Mode = 'encode' | 'decode'

export default function Base64Converter() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')

  const decoded = mode === 'decode' ? decodeBase64(input) : null
  const output =
    input === ''
      ? ''
      : mode === 'encode'
        ? encodeBase64(input)
        : decoded && decoded.ok
          ? decoded.value
          : ''
  const errorCode: Base64ErrorCode | null =
    mode === 'decode' && input !== '' && decoded && !decoded.ok ? decoded.error : null

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    setInput('')
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex gap-1 mb-6">
        {(['encode', 'decode'] as const).map((m) => (
          <Button
            key={m}
            onClick={() => handleModeChange(m)}
            variant={mode === m ? 'default' : 'secondary'}
            size="sm"
          >
            {m === 'encode' ? 'Encode' : 'Decode'}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <Label htmlFor="base64-input">
              {mode === 'encode' ? 'Plain text' : 'Base64'}
            </Label>
            <span className="text-xs text-muted-foreground">
              {input.length} chars · {byteLength(input)} bytes
            </span>
          </div>
          <Textarea
            id="base64-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Type or paste text…' : 'Paste a Base64 string…'}
            rows={4}
            className="resize-y font-mono"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <Label htmlFor="base64-output">
              {mode === 'encode' ? 'Base64' : 'Plain text'}
            </Label>
            <span className="text-xs text-muted-foreground">
              {output.length} chars · {byteLength(output)} bytes
            </span>
          </div>
          <div className="relative">
            <Textarea
              id="base64-output"
              value={output}
              readOnly
              placeholder="—"
              rows={4}
              className="resize-y bg-muted pr-11 text-muted-foreground font-mono"
            />
            <CopyButton value={output} className="absolute right-2 top-2" />
          </div>
        </div>

        {errorCode && (
          <p className="text-sm text-destructive" role="alert">
            {ERROR_MESSAGES[errorCode]}
          </p>
        )}
      </div>
    </div>
  )
}
