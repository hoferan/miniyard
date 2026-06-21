'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
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
    return stored !== null ? parseInt(stored, 10) : null
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
      setState((prev) => {
        const next = recordResult(prev, Date.now())
        if (next.personalBest !== null) savePersonalBest(next.personalBest)
        return next
      })
    }
  }, [state.phase, clearTimer])

  const isGreen = state.phase === 'ready'
  const isClickable = state.phase === 'waiting' || state.phase === 'ready'

  return (
    <div
      className={cn(
        'flex flex-col select-none touch-none transition-colors duration-100',
        'min-h-[calc(100dvh-8rem)]',
        isGreen ? 'bg-green-500' : 'bg-zinc-900'
      )}
      onClick={isClickable ? handleScreenClick : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={isGreen ? MESSAGES.clickNow : MESSAGES.waitForGreen}
    >
      <div className="flex flex-1 items-center justify-center px-6">
        {state.phase === 'idle' && (
          <div className="flex flex-col items-center gap-6 text-center">
            {falseStart && (
              <p className="text-yellow-400 text-lg font-semibold">{MESSAGES.tooEarly}</p>
            )}
            <Button
              size="lg"
              onClick={beginWaiting}
              className="px-10 py-6 text-xl font-bold"
            >
              {MESSAGES.tapToStart}
            </Button>
          </div>
        )}

        {state.phase === 'waiting' && (
          <p className="text-zinc-400 text-2xl font-semibold pointer-events-none">
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
            <p className="text-7xl font-extrabold text-white tabular-nums">
              {MESSAGES.ms(state.reactionTime)}
            </p>
            {state.personalBest !== null && (
              <p className="text-zinc-400 text-sm">
                {MESSAGES.personalBestLabel}:{' '}
                <span className="font-semibold text-white">
                  {MESSAGES.ms(state.personalBest)}
                </span>
              </p>
            )}
            <Button size="lg" onClick={beginWaiting} className="mt-2 px-10 font-bold">
              {MESSAGES.tryAgain}
            </Button>
          </div>
        )}
      </div>

      {state.history.length > 0 && (
        <div className="px-4 pb-6 flex flex-col items-center gap-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            {MESSAGES.historyLabel}
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {state.history.map((ms, i) => (
              <span
                key={i}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-mono',
                  i === 0 && state.phase === 'result'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-zinc-800 text-zinc-300'
                )}
              >
                {MESSAGES.ms(ms)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
