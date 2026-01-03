import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Cell, GameState, RoundSnapshot, RoundState } from '../../lib/types'
import { WORDS } from '../../lib/words'
import { scoreGuess } from '../../lib/score'

function emptyGrid(): Cell[][] {
  return Array.from({ length: 6 }, () =>
    Array.from({ length: 5 }, () => ({ ch: '', state: 'unset' as const }))
  )
}

function snapshotOf(r: RoundState): RoundSnapshot {
  const clonedGrid = r.grid.map(row => row.map(c => ({ ch: c.ch, state: c.state } as Cell)));
  return { grid: clonedGrid, row: r.row, col: r.col, status: r.status, target: r.target };
}

function pickRandom(arr: string[]): { word: string; idx: number } {
  const idx = Math.floor(Math.random() * arr.length)
  return { word: arr[idx], idx }
}

const initialState: GameState = {
  wordsLeft: [],
  usedWords: [],
  wins: 0,
  fails: 0,
  current: null,
  gameOver: false,
}

const game = createSlice({
  name: 'game',
  initialState,
  reducers: {
    newGame(state) {
      state.wordsLeft = [...WORDS]
      state.usedWords = []
      state.wins = 0
      state.fails = 0
      state.gameOver = false
      // create first round
      const { word, idx } = pickRandom(state.wordsLeft)
      state.wordsLeft.splice(idx, 1)
      state.usedWords.push(word)
      state.current = {
        target: word,
        grid: emptyGrid(),
        row: 0, col: 0,
        status: 'playing',
        history: []
      }
    },
    newRound(state) {
      if (!state.current) return
      if (state.wordsLeft.length === 0) {
        state.current = null
        state.gameOver = true
        return
      }
      const { word, idx } = pickRandom(state.wordsLeft)
      state.wordsLeft.splice(idx, 1)
      state.usedWords.push(word)
      state.current = {
        target: word,
        grid: emptyGrid(),
        row: 0, col: 0,
        status: 'playing',
        history: []
      }
    },
    typeChar(state, action: PayloadAction<string>) {
      const currState = state.current
      if (!currState || currState.status !== 'playing') return
      const ch = action.payload.toUpperCase()
      if (!/^[A-Z]$/.test(ch)) return
      if (currState.col >= 5) return
      currState.history.push(snapshotOf(currState))
      currState.grid[currState.row][currState.col].ch = ch
      currState.col += 1
    },
    backspace(state) {
      const currState = state.current
      if (!currState || currState.status !== 'playing') return
      if (currState.col === 0) return
      currState.history.push(snapshotOf(currState))
      currState.col -= 1
      currState.grid[currState.row][currState.col].ch = ''
      currState.grid[currState.row][currState.col].state = 'unset'
    },
    submit(state) {
      const currState = state.current
      if (!currState || currState.status !== 'playing') return
      if (currState.col !== 5) return
      currState.history.push(snapshotOf(currState))
      const guess = currState.grid[currState.row].map(c => c.ch).join('')
      const result = scoreGuess(guess, currState.target)
      for (let i = 0; i < 5; i++) currState.grid[currState.row][i].state = result[i]
      const allCorrect = result.every(s => s === 'correct')
      if (allCorrect) {
        currState.status = 'won'
        return
      }
      if (currState.row === 5) {
        currState.status = 'lost'
        return
      }
      currState.row += 1
      currState.col = 0
    },
    undo(state) {
      const currState = state.current
      if (!currState || currState.history.length === 0) return
      const prev = currState.history.pop() as RoundSnapshot
      currState.grid = prev.grid
      currState.row = prev.row
      currState.col = prev.col
      currState.status = prev.status
      currState.target = prev.target
    },
    acknowledgeRound(state) {
      // call after win/lose to bump counters and enable New Round button in UI
      const currState = state.current
      if (!currState) return
      if (currState.status === 'won') state.wins += 1
      else if (currState.status === 'lost') state.fails += 1
    }
  }
})

export const { newGame, newRound, typeChar, backspace, submit, undo, acknowledgeRound } = game.actions
export default game.reducer
