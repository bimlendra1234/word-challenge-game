import { describe, it, expect } from 'vitest'
import { scoreGuess } from '../lib/score'
import type { LetterState } from '../lib/types'

describe('scoreGuess', () => {
  it('marks all correct when guess matches target exactly', () => {
    expect(scoreGuess('APPLE', 'APPLE')).toEqual([
      'correct', 'correct', 'correct', 'correct', 'correct'
    ])
  })

  it('marks correct and present letters', () => {
    expect(scoreGuess('ACBDE', 'ABCDE')).toEqual([
      'correct', 'present', 'present', 'correct', 'correct'
    ])
  })

  it('marks all absent when guess shares no letters with target', () => {
    expect(scoreGuess('XXXXX', 'APPLE')).toEqual([
      'absent', 'absent', 'absent', 'absent', 'absent'
    ])
  })

  it('handles duplicate letters in guess when only one in target', () => {
    expect(scoreGuess('SCOOP', 'COLOR')).toEqual([
      'absent', 'present', 'present', 'correct', 'absent'
    ])
  })

  it('handles duplicate letters in target correctly', () => {
    expect(scoreGuess('COCOA', 'COLOR')).toEqual([
      'correct', 'correct', 'absent', 'correct', 'absent'
    ])
  })

  it('handles repeated present letters fairly (only once if needed)', () => {
    expect(scoreGuess('LOLLY', 'COLOR')).toEqual([
      'absent', 'correct', 'correct', 'absent', 'absent'
    ])
  })
})