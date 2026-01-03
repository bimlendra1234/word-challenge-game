import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from './store'
import { acknowledgeRound, backspace, newGame, newRound, submit, typeChar, undo } from './features/game/gameSlice'
import type { Cell } from './lib/types'

function Board({ grid }: { grid: Cell[][] }) {
  return (
    <div className="grid panel" role="grid" aria-label="guess grid">
      {grid.map((row, r) => (
        <React.Fragment key={r}>
          {row.map((cell, c) => (
            <div key={r + '-' + c}
                 role="gridcell"
                 className={'cell ' + (cell.state !== 'unset' ? cell.state : '')}>
              {cell.ch}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

function letterSets(grid: Cell[][]) {
  const present = new Set<string>()
  const absent = new Set<string>()
  for (const row of grid) {
    for (const cell of row) {
      if (cell.state === 'present' || cell.state === 'correct') present.add(cell.ch)
      else if (cell.state === 'absent') absent.add(cell.ch)
    }
  }
  // remove empty strings
  present.delete(''); absent.delete('')
  return { present: Array.from(present).sort(), absent: Array.from(absent).sort() }
}

const KEYS = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('')

export default function App() {
  const dispatch = useDispatch()
  const game = useSelector((s: RootState) => s.game)
  const currentGame = game.current

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!currentGame) return
      if (e.key === 'Enter') dispatch(submit())
      else if (e.key === 'Backspace') dispatch(backspace())
      else if (/^[a-zA-Z]$/.test(e.key)) dispatch(typeChar(e.key))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch, currentGame])

  const { present, absent } = useMemo(() => (currentGame ? letterSets(currentGame.grid) : { present: [], absent: [] }), [currentGame?.grid])

  const statusText = currentGame?.status === 'won' ? 'You won this round!' :
                     currentGame?.status === 'lost' ? 'You lost this round.' : ''

  useEffect(() => {
    // bump wins/fails once when round finishes
    if (currentGame && (currentGame.status === 'won' || currentGame.status === 'lost')) {
      dispatch(acknowledgeRound())
    }
  }, [dispatch, currentGame?.status])

  return (
    <div className="container">
      <header>
        <h1>WordLogic</h1>
        <div className="score">
          <span className="badge">Wins: {game.wins}</span>
          <span className="badge">Fails: {game.fails}</span>
          <span className="badge">Used: {game.usedWords.length}/8</span>
        </div>
      </header>

      {!currentGame && !game.gameOver && (
        <div className="controls">
          <button onClick={() => dispatch(newGame())}>New Game</button>
        </div>
      )}

      {currentGame && (
        <>
          <Board grid={currentGame.grid} />
          <div className="status" aria-live="polite">{statusText}</div>
          <div className="controls">
            <button onClick={() => dispatch(undo())} disabled={!currentGame || currentGame.history.length === 0}>Undo</button>
            {(currentGame.status === 'won' || currentGame.status === 'lost') && (
              <button onClick={() => dispatch(newRound())}>New Round</button>
            )}
            <button onClick={() => dispatch(newGame())}>New Game</button>
          </div>

          <div className="lists">
            <div className="list panel">
              <strong>Not in word</strong>
              <div style={{marginTop: 8}}>
                {absent.length === 0 ? <span className="badge">—</span> :
                  absent.map(l => <span key={l} className="badge" style={{marginRight: 6}}>{l}</span>)}
              </div>
            </div>
            <div className="list panel">
              <strong>Letters present</strong>
              <div style={{marginTop: 8}}>
                {present.length === 0 ? <span className="badge">—</span> :
                  present.map(l => <span key={l} className="badge" style={{marginRight: 6}}>{l}</span>)}
              </div>
            </div>
          </div>

          <div className="panel keys" aria-label="on-screen keyboard">
            {KEYS.map(k => (
              <div key={k} className="key" onClick={() => dispatch(typeChar(k))}>{k}</div>
            ))}
            <div className="key" onClick={() => dispatch(backspace())}>⌫</div>
            <div className="key" onClick={() => dispatch(submit())}>Enter</div>
          </div>
        </>
      )}

      {game.gameOver && (
        <div className="gameover">
          <p>Game Over – you completed all words. Start a New Game to play again.</p>
          <div className="controls">
            <button onClick={() => dispatch(newGame())}>New Game</button>
          </div>
        </div>
    )}
    </div>
  )
}
