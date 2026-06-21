'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  GameState,
  createInitialState,
  startWaiting,
  triggerReady,
  recordResult,
  handleFalseStart,
} from './logic'
import { MESSAGES } from './messages'

const PERSONAL_BEST_KEY = 'reaction-time-test:personal-best'

function loadPersonalBest(): number | null {
  try {
    const stored = localStorage.getItem(PERSONAL_BEST_KEY)
    if (stored === null) return null
    const parsed = parseInt(stored, 10)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

function savePersonalBest(ms: number): void {
  try {
    localStorage.setItem(PERSONAL_BEST_KEY, String(ms))
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export default function ReactionTimeTest() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [falseStart, setFalseStart] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const personalBest = loadPersonalBest()
    if (personalBest !== null) {
      setState((prev) => ({ ...prev, personalBest }))
    }
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  const beginWaiting = useCallback(() => {
    setFalseStart(false)
    clearTimer()
    setState((prev) => startWaiting(prev))
    const delay = Math.floor(Math.random() * 2500) + 1500
    timerRef.current = setTimeout(() => {
      const readyAt = Date.now()
      setState((prev) => triggerReady(prev, readyAt))
    }, delay)
  }, [clearTimer])

  const handleScreenClick = useCallback(() => {
    if (state.phase === 'waiting') {
      clearTimer()
      setFalseStart(true)
      setState(handleFalseStart)
      return
    }
    if (state.phase === 'ready') {
      const now = Date.now()
      setState((prev) => {
        if (prev.phase !== 'ready') return prev
        const next = recordResult(prev, now)
        if (next.personalBest !== null) savePersonalBest(next.personalBest)
        return next
      })
    }
  }, [state.phase, clearTimer])

  const isGreen = state.phase === 'ready'
  const isClickable = state.phase === 'waiting' || state.phase === 'ready'

  const arenaBg = isGreen
    ? 'bg-green-500'
    : state.phase === 'waiting'
    ? 'bg-slate-800 dark:bg-slate-900'
    : 'bg-muted/60'

  return (
    <div className="mx-auto max-w-lg px-4 pb-8">
      <Card className="overflow-hidden py-0 gap-0">
        {/* Info bar: instructions + personal best */}
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-sm text-muted-foreground">Tap when green — react as fast as you can</p>
          {state.personalBest !== null && (
            <Badge variant="outline" className="ml-4 shrink-0">
              {MESSAGES.personalBestLabel}: {MESSAGES.ms(state.personalBest)}
            </Badge>
          )}
        </div>
        <Separator />

        {/* Arena */}
        <div
          role={isClickable ? 'button' : undefined}
          aria-label={
            isGreen ? MESSAGES.clickNow : isClickable ? MESSAGES.waitForGreen : undefined
          }
          className={cn(
            'flex h-72 items-center justify-center select-none touch-none transition-colors duration-100',
            isClickable && 'cursor-pointer',
            arenaBg,
          )}
          onClick={isClickable ? handleScreenClick : undefined}
        >
          {state.phase === 'idle' && (
            <div className="flex flex-col items-center gap-6 px-6 text-center">
              {falseStart && (
                <p className="text-amber-600 dark:text-yellow-400 text-base font-semibold">
                  {MESSAGES.tooEarly}
                </p>
              )}
              <Button size="lg" onClick={beginWaiting} className="px-10 py-6 text-xl font-bold">
                {MESSAGES.tapToStart}
              </Button>
            </div>
          )}

          {state.phase === 'waiting' && (
            <p className="text-slate-300 text-2xl font-semibold pointer-events-none">
              {MESSAGES.waitForGreen}
            </p>
          )}

          {state.phase === 'ready' && (
            <p className="text-white text-5xl font-extrabold drop-shadow-lg pointer-events-none">
              {MESSAGES.clickNow}
            </p>
          )}

          {state.phase === 'result' && state.reactionTime !== null && (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-7xl font-extrabold tabular-nums text-foreground">
                {MESSAGES.ms(state.reactionTime)}
              </p>
              <Button size="lg" onClick={beginWaiting} className="px-10 font-bold">
                {MESSAGES.tryAgain}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* History */}
      {state.history.length > 0 && (
        <Card className="mt-4">
          <CardContent>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
              {MESSAGES.historyLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {state.history.map((ms, i) => (
                <Badge
                  key={`${i}-${ms}`}
                  variant={i === 0 && state.phase === 'result' ? 'default' : 'secondary'}
                >
                  {MESSAGES.ms(ms)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
