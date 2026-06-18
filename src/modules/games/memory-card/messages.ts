export const MESSAGES = {
  movesLabel: 'Moves:',
  timeLabel: 'Time:',
  bestLabel: 'Best:',
  hiddenCard: 'Hidden card',
  newGame: 'New Game',
  playAgain: 'Play again',
  youWon: 'You won!',
  newBest: 'New best score!',
  elapsed: (s: number) => `${s}s`,
  bestMoves: (moves: number) => `${moves} moves`,
  summary: (moves: number, elapsed: number) => `${moves} moves in ${elapsed}s`,
}
