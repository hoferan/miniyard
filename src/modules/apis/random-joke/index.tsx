'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES, isTwoPart, type Joke, type JokeCategory } from './logic'
import { fetchJoke } from './api'
import { ARIA, MESSAGES, type ErrorKey } from './messages'

export default function RandomJoke() {
  const [category, setCategory] = useState<JokeCategory>('Any')
  const [safeMode, setSafeMode] = useState(true)
  const [joke, setJoke] = useState<Joke | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState<ErrorKey | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFetch() {
    setLoading(true)
    setError(null)
    // Reset the reveal so a punchline never carries over to the next joke.
    setRevealed(false)
    try {
      setJoke(await fetchJoke(category, safeMode))
    } catch (e) {
      const key = (e as Error).message
      setError((key in MESSAGES.errors ? key : 'upstream') as ErrorKey)
      setJoke(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <div className="space-y-2">
        <Label htmlFor="joke-category">{MESSAGES.categoryLabel}</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as JokeCategory)}>
          <SelectTrigger id="joke-category" aria-label={ARIA.category}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="safe-mode">{MESSAGES.safeModeLabel}</Label>
          <p className="text-xs text-muted-foreground">{MESSAGES.safeModeHint}</p>
        </div>
        <Switch
          id="safe-mode"
          checked={safeMode}
          onCheckedChange={setSafeMode}
          aria-label={ARIA.safeMode}
        />
      </div>

      <Button onClick={handleFetch} disabled={loading} className="w-full" aria-label={ARIA.fetch}>
        {loading ? MESSAGES.loading : joke ? MESSAGES.fetchButton : MESSAGES.firstFetchButton}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{MESSAGES.errors[error]}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-3 rounded-lg border bg-card p-6">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      )}

      {!loading && joke && (
        <div className="space-y-4 rounded-lg border bg-card p-6" aria-label={ARIA.joke}>
          {joke.category && <Badge variant="secondary">{joke.category}</Badge>}

          {isTwoPart(joke) ? (
            <div className="space-y-4">
              <p className="text-lg">{joke.setup}</p>
              {revealed ? (
                <p className="text-lg font-semibold">{joke.delivery}</p>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setRevealed(true)}
                  className="w-full"
                  aria-label={ARIA.reveal}
                >
                  {MESSAGES.revealButton}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-lg">{joke.text}</p>
          )}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <a
          href={MESSAGES.attributionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          {MESSAGES.attribution}
        </a>
      </p>
    </div>
  )
}
