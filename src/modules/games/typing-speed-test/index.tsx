'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  GameState,
  WORD_LIST,
  createInitialState,
  generatePassage,
  getResults,
  handleKeypress,
  tick,
} from './logic'
import { MESSAGES } from './messages'

const PASSAGE_WORD_COUNT = 90
const PERSONAL_BEST_KEY = 'typing-speed-test:personal-best'

function loadPersonalBest(): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(PERSONAL_BEST_KEY)
  return stored ? Number(stored) : 0
}

function savePersonalBest(wpm: number): void {
  localStorage.setItem(PERSONAL_BEST_KEY, String(Math.round(wpm)))
}

function newGame(): GameState {
  return createInitialState(generatePassage(WORD_LIST, PASSAGE_WORD_COUNT))
}

export default function TypingSpeedTest() {
  // null until first client render — avoids SSR/client hydration mismatch from Math.random()
  const [state, setState] = useState<GameState | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [personalBest, setPersonalBest] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)
  // null = not counting; 3/2/1 = counting; 0 = showing GO!
  const [countdown, setCountdown] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Prevents onInput from double-processing when onKeyDown already handled the keystroke
  const keydownHandled = useRef(false)

  useEffect(() => {
    setState(newGame())
    setPersonalBest(loadPersonalBest())
  }, [])

  const phase = state?.phase ?? 'idle'

  // Drive the 3-2-1-GO! countdown; focus input once GO! fades out
  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      const t = setTimeout(() => {
        setCountdown(null)
        inputRef.current?.focus()
      }, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Tick every 100 ms while playing to update countdown and detect expiry
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        const currentNow = Date.now()
        setNow(currentNow)
        setState((prev) => (prev ? tick(prev, currentNow) : prev))
      }, 100)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  // Save personal best when game finishes
  useEffect(() => {
    if (!state || state.phase !== 'finished' || state.startedAt === null) return
    const results = getResults(state, now)
    const pb = loadPersonalBest()
    if (results.wpm > pb) {
      savePersonalBest(results.wpm)
      setPersonalBest(Math.round(results.wpm))
      setIsNewBest(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Start the 3-2-1 countdown when the user clicks the passage area from idle
  const handleStart = useCallback(() => {
    if (phase !== 'idle' || countdown !== null) return
    setCountdown(3)
  }, [phase, countdown])

  // Desktop: reliable keydown gives us exact key names including Backspace
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    keydownHandled.current = false
    // Block all input while counting down
    if (countdown !== null) return
    if (!state || state.phase === 'finished') return
    if (
      e.key === 'Backspace' ||
      (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey)
    ) {
      e.preventDefault()
      keydownHandled.current = true
      const currentNow = Date.now()
      setNow(currentNow)
      setState((prev) => (prev ? handleKeypress(prev, e.key, currentNow) : prev))
    }
  }, [state, countdown])

  // Mobile fallback: InputEvent.data carries the typed character; null signals deletion.
  // Skipped when onKeyDown already handled the event to prevent double-processing.
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    if (keydownHandled.current) {
      keydownHandled.current = false
      e.currentTarget.value = ''
      return
    }
    // Block all input while counting down
    if (countdown !== null) {
      e.currentTarget.value = ''
      return
    }
    const currentNow = Date.now()
    const native = e.nativeEvent as InputEvent
    if (native.inputType === 'deleteContentBackward') {
      setNow(currentNow)
      setState((prev) => (prev ? handleKeypress(prev, 'Backspace', currentNow) : prev))
    } else if (native.data) {
      setNow(currentNow)
      setState((prev) => (prev ? handleKeypress(prev, native.data as string, currentNow) : prev))
    }
    // Reset to keep the input visually empty
    e.currentTarget.value = ''
  }, [countdown])

  const handleRestart = useCallback(() => {
    setState(newGame())
    setNow(Date.now())
    setIsNewBest(false)
    setCountdown(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  if (!state) return null

  const elapsed = state.startedAt !== null ? (state.endedAt ?? now) - state.startedAt : 0
  const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000))
  const results = phase === 'finished' ? getResults(state, now) : null
  const liveResults = phase === 'playing' && elapsed > 0 ? getResults(state, now) : null

  // Group passage characters by word so line-breaks only happen at word boundaries
  const wordTokens = state.passage.split(' ').reduce<{ word: string; start: number }[]>(
    (acc, word, i) => {
      const start = i === 0 ? 0 : acc[i - 1].start + acc[i - 1].word.length + 1
      return [...acc, { word, start }]
    },
    []
  )

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      {/* Stats bar */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <span
          className={cn(
            'tabular-nums font-medium',
            phase === 'playing' && remaining <= 10
              ? 'text-destructive font-bold'
              : 'text-muted-foreground'
          )}
        >
          {phase === 'idle' && MESSAGES.timerIdle}
          {phase === 'playing' && MESSAGES.countdown(remaining)}
          {phase === 'finished' && MESSAGES.timerDone}
        </span>
        <div className="flex gap-4 text-muted-foreground">
          {liveResults !== null && (
            <span className="tabular-nums">{MESSAGES.liveWpm(Math.round(liveResults.wpm))}</span>
          )}
          {personalBest > 0 && (
            <span className="tabular-nums">{MESSAGES.personalBest(personalBest)}</span>
          )}
        </div>
      </div>

      {/* Passage display */}
      {phase !== 'finished' && (
        <div
          role="button"
          tabIndex={0}
          aria-label={MESSAGES.typingAreaLabel}
          className={cn(
            'relative cursor-text select-none rounded-xl border bg-card p-6 font-mono text-base leading-8 shadow-sm focus-within:ring-2 focus-within:ring-ring sm:text-lg min-h-[10rem]',
          )}
          onClick={handleStart}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleStart()
            if (e.key === 'Escape' && countdown !== null) setCountdown(null)
          }}
        >
          {/* Idle overlay */}
          {phase === 'idle' && countdown === null && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/90 backdrop-blur-[2px]">
              <span className="text-sm text-muted-foreground">{MESSAGES.clickToStart}</span>
            </div>
          )}
          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/90 backdrop-blur-[2px]">
              <span className="text-7xl font-bold tabular-nums text-foreground select-none">
                {countdown === 0 ? MESSAGES.countdownGo : countdown}
              </span>
            </div>
          )}
          {wordTokens.map(({ word, start }, wi) => {
            const spaceIdx = start + word.length
            return (
              <Fragment key={start}>
                <span className="inline-block">
                  {word.split('').map((char, ci) => {
                    const idx = start + ci
                    const charState = state.charStates[idx]
                    const isCurrent = idx === state.currentIndex
                    return (
                      <span
                        key={idx}
                        className={cn(
                          isCurrent && charState === 'pending' && 'border-l-2 border-foreground animate-pulse',
                          charState === 'correct' && 'text-green-600 dark:text-green-400',
                          charState === 'incorrect' &&
                            'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-sm',
                          charState === 'pending' && !isCurrent && 'text-muted-foreground/50',
                          isCurrent && charState === 'pending' && 'text-foreground',
                        )}
                      >
                        {char}
                      </span>
                    )
                  })}
                </span>
                {wi < wordTokens.length - 1 && (
                  <span
                    className={cn(
                      spaceIdx === state.currentIndex && state.charStates[spaceIdx] === 'pending' && 'border-l-2 border-foreground animate-pulse',
                      state.charStates[spaceIdx] === 'correct' && 'text-green-600 dark:text-green-400',
                      state.charStates[spaceIdx] === 'incorrect' &&
                        'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-sm',
                      state.charStates[spaceIdx] === 'pending' &&
                        spaceIdx !== state.currentIndex &&
                        'text-muted-foreground/50',
                      spaceIdx === state.currentIndex &&
                        state.charStates[spaceIdx] === 'pending' &&
                        'text-foreground',
                    )}
                  >
                    {' '}
                  </span>
                )}
              </Fragment>
            )
          })}
          {/* Hidden input captures all keyboard input (including mobile soft keyboard) */}
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="absolute left-0 top-0 h-full w-full opacity-0 cursor-default"
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            aria-hidden="true"
            tabIndex={0}
          />
        </div>
      )}

      {/* Results card */}
      {phase === 'finished' && results && (
        <Card>
          <CardHeader className="pb-0 text-center">
            <CardTitle className="text-xl">{MESSAGES.resultsHeading}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <div className="text-4xl font-extrabold text-primary tabular-nums">
                  {Math.round(results.wpm)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{MESSAGES.statWpm}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <div className="text-4xl font-extrabold tabular-nums">
                  {Math.round(results.accuracy)}%
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{MESSAGES.statAccuracy}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <div className="text-4xl font-extrabold tabular-nums">{results.charsTyped}</div>
                <div className="mt-1 text-sm text-muted-foreground">{MESSAGES.statCharacters}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <div className="text-4xl font-extrabold tabular-nums">{results.errorCount}</div>
                <div className="mt-1 text-sm text-muted-foreground">{MESSAGES.statErrors}</div>
              </div>
            </div>
            {isNewBest && (
              <p className="text-center text-sm font-semibold text-primary">
                {MESSAGES.newPersonalBest}
              </p>
            )}
            <Button className="w-full" onClick={handleRestart}>
              {MESSAGES.tryAgain}
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
