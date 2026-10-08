export const MESSAGES = {
  scoreLabel: 'Score:',
  bestLabel: 'Best:',
  newGame: 'New game',
  boardLabel: '2048 game board',
  instructions: 'Swipe or use the arrow keys to slide the tiles. Merge equal numbers to reach 2048.',
  winTitle: 'You made 2048!',
  winDescription: (score: number) => `Score so far: ${score}. Keep going for an even bigger tile?`,
  keepGoing: 'Keep going',
  gameOverTitle: 'Game over',
  gameOverSummary: (score: number) => `No moves left. You scored ${score}.`,
  newBest: 'New best score!',
}
