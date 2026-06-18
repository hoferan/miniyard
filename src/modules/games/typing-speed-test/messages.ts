export const MESSAGES = {
  timerIdle: '60 s',
  timerDone: 'Done',
  countdown: (seconds: number) => `${seconds} s`,
  liveWpm: (wpm: number) => `${wpm} WPM`,
  personalBest: (wpm: number) => `Best: ${wpm} WPM`,

  typingAreaLabel: 'Typing area — click to focus and start typing',
  clickToStart: 'Click here and start typing',
  countdownGo: 'GO!',

  resultsHeading: 'Results',
  statWpm: 'WPM',
  statAccuracy: 'Accuracy',
  statCharacters: 'Characters',
  statErrors: 'Errors',
  newPersonalBest: 'New personal best!',
  tryAgain: 'Try again',
}
