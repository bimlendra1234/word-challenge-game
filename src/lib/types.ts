export type LetterState = 'unset' | 'correct' | 'present' | 'absent'

export interface Cell { ch: string; state: LetterState }
export type Grid = Cell[][] // 6 x 5

export interface RoundSnapshot {
  grid: Grid
  row: number
  col: number
  status: 'playing' | 'won' | 'lost'
  target: string
}

export interface RoundState extends RoundSnapshot {
  history: RoundSnapshot[]
}

export interface GameState {
  wordsLeft: string[]
  usedWords: string[]
  wins: number
  fails: number
  current: RoundState | null
  gameOver: boolean
}
