'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CopyButton } from '@/components/copy-button'
import { convertAllCases, type CaseConversions } from './logic'

const FORMAT_ROWS: { key: keyof CaseConversions; label: string }[] = [
  { key: 'upperCase', label: 'UPPER CASE' },
  { key: 'lowerCase', label: 'lower case' },
  { key: 'titleCase', label: 'Title Case' },
  { key: 'sentenceCase', label: 'Sentence case' },
  { key: 'camelCase', label: 'camelCase' },
  { key: 'pascalCase', label: 'PascalCase' },
  { key: 'snakeCase', label: 'snake_case' },
  { key: 'kebabCase', label: 'kebab-case' },
  { key: 'screamingSnakeCase', label: 'SCREAMING_SNAKE_CASE' },
]

export default function TextCaseConverter() {
  const [input, setInput] = useState('')
  const results = convertAllCases(input)

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <div>
        <Label htmlFor="text-case-input" className="mb-1.5 block">
          Text
        </Label>
        <Textarea
          id="text-case-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text to convert..."
          rows={4}
          className="resize-y"
        />
      </div>

      <div className="space-y-3">
        {FORMAT_ROWS.map(({ key, label }) => (
          <div key={key}>
            <Label htmlFor={`text-case-output-${key}`} className="mb-1.5 block">
              {label}
            </Label>
            <div className="relative">
              <Input
                id={`text-case-output-${key}`}
                value={results[key]}
                readOnly
                className="pr-11 bg-muted text-muted-foreground font-mono"
              />
              <CopyButton
                value={results[key]}
                label={`Copy ${label} value`}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
