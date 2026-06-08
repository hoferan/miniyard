'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { encodeBase64, decodeBase64, byteLength } from './logic'

type Mode = 'encode' | 'decode'

export default function Base64Converter() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const decoded = mode === 'decode' ? decodeBase64(input) : null
  const output =
    input === ''
      ? ''
      : mode === 'encode'
        ? encodeBase64(input)
        : decoded && decoded.ok
          ? decoded.value
          : ''
  const error = mode === 'decode' && input !== '' && decoded && !decoded.ok ? decoded.error : null

  function handleModeChange(next: Mode) {
    if (next === mode) return
    setMode(next)
    setInput('')
    setCopied(false)
  }

  async function handleCopy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Base64 Encoder / Decoder</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Encode text to Base64 or decode it back. Everything runs in your browser — nothing is sent
        anywhere.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-6">
        {(['encode', 'decode'] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
              mode === m
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="base64-input" className="text-sm font-medium">
              {mode === 'encode' ? 'Plain text' : 'Base64'}
            </label>
            <span className="text-xs text-muted-foreground">
              {input.length} chars · {byteLength(input)} bytes
            </span>
          </div>
          <textarea
            id="base64-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Type or paste text…' : 'Paste a Base64 string…'}
            rows={4}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="base64-output" className="text-sm font-medium">
              {mode === 'encode' ? 'Base64' : 'Plain text'}
            </label>
            <span className="text-xs text-muted-foreground">
              {output.length} chars · {byteLength(output)} bytes
            </span>
          </div>
          <div className="relative">
            <textarea
              id="base64-output"
              value={output}
              readOnly
              placeholder="—"
              rows={4}
              className="w-full resize-y rounded-md border border-input bg-muted px-3 py-2 pr-11 text-sm text-muted-foreground placeholder:text-muted-foreground focus-visible:outline-none font-mono"
            />
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              aria-label="Copy result to clipboard"
              className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
