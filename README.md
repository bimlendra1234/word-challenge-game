# WordLogic Challenge

Built with React + TypeScript + Redux Toolkit (Vite) that implements the POC Requirements : WordLogic Rules and Application Rules from the challenge.

## What’s implemented

- 5×6 grid, 6 guesses per round; scoring shows correct (In green)/ Letter present / Letter absent states per letter.
- Random word chosen from ADOBE, PHOTO, LIGHT, VIDEO, STOCK, COLOR, EMAIL, FONTS and words are not reused across rounds.
- New Game (starts fresh) and New Round (after win/lose). Shows Game Over when all words are used.
- Game information on screen:
  - Letters guessed not in the word
  - Letters guessed that are in the word
  - Wins and Fails counters for this game
- Undo with unlimited steps (reverts typing, delete, and submit operations).
- Keyboard input (A‑Z, Enter, Backspace) and a minimal on‑screen keyboard.
- Simple, accessible UI.

## Tech

- React 18 + TypeScript • Redux Toolkit • Vite
- No backend required for the POC; the secure server design is described in `DESIGN.md`.

## Getting started

```bash
npm install
npm run dev
```

## Testing

All test files are located under:

```
src/__tests__/
```

The main test file is:
```
src/__tests__/score.test.ts
```

It contains unit tests for:
- Correct and present letter marking
- Duplicate letters in guesses and targets
- Edge cases with partial overlaps

```bash
npm run test
```

## Project structure

```
src/
  features/game/gameSlice.ts   # game + round logic, undo
  lib/score.ts                 # 2-pass Wordle-style scoring
  lib/words.ts                 # fixed word list
  lib/types.ts                 # types
  App.tsx                      # UI composition
  main.tsx                     # bootstrap
  styles.css                   # minimal styles
```

## How Undo works

Each user action pushes a snapshot of the round state (`grid`, `row`, `col`, `status`, `target`) on a stack. Pressing Undo pops the latest snapshot and restores it. This makes Undo unlimited and safely handles reverting submitted rows.

## Notes

- The POC intentionally accepts any 5‑letter guess. This matches the minimal spec and keeps the focus on game logic and UI.
- The “present/absent letters” lists are derived from the scored cells, so they always reflect the current board (Undo updates them automatically).
