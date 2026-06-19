'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { checkPassword, type StrengthLevel } from './logic'
import { STRENGTH_LABELS, FEEDBACK, UI } from './messages'

const BAR_COLORS: Record<StrengthLevel, string> = {
  0: 'bg-red-500',
  1: 'bg-orange-400',
  2: 'bg-yellow-400',
  3: 'bg-lime-500',
  4: 'bg-green-500',
}

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)

  const result = checkPassword(password)
  const isEmpty = password === ''

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="password-input">{UI.inputLabel}</Label>
        <div className="relative">
          <Input
            id="password-input"
            type={visible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={UI.placeholder}
            className="pr-10"
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? UI.hidePassword : UI.showPassword}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {!isEmpty && (
        <>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{STRENGTH_LABELS[result.level]}</span>
              <span className="text-xs text-muted-foreground">{result.score} / 6</span>
            </div>
            <div className="flex gap-1" role="progressbar" aria-valuenow={result.level} aria-valuemin={0} aria-valuemax={4}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors duration-200 ${
                    i <= result.level ? BAR_COLORS[result.level] : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {result.failedChecks.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">{UI.feedbackHeading}</p>
              <ul className="space-y-1">
                {result.failedChecks.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 text-destructive" aria-hidden="true">✕</span>
                    {FEEDBACK[key]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
