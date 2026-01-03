import type { LetterState } from './types'

// Two-pass Wordle-style scoring that handles duplicate letters correctly
export function scoreGuess(guess: string, target: string): LetterState[] {
  const res: LetterState[] = Array(5).fill('absent')
  const counts: Record<string, number> = {}
  for (let i = 0; i < 5; i++) {
    const tgt = target[i]
    counts[tgt] = (counts[tgt] ?? 0) + 1
  }
  // Pass 1: mark 'correct'
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      res[i] = 'correct'
      counts[guess[i]]--
    }
  }
  // Pass 2: mark 'present'
  for (let i = 0; i < 5; i++) {
    if (res[i] === 'correct') continue
    const gess = guess[i]
    if ((counts[gess] ?? 0) > 0) {
      res[i] = 'present'
      counts[gess]--
    }
  }
  return res
}
