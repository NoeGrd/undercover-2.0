export type Role = 'civil' | 'undercover' | 'mrwhite'

export interface Player {
  id: string
  name: string
  role: Role
  word: string | null
  alive: boolean
  hasRevealed: boolean
}

export type Phase =
  | 'setup'
  | 'reveal'
  | 'discuss'
  | 'vote'
  | 'roundResult'
  | 'mrwhiteGuess'
  | 'gameOver'

export type Winner = 'civils' | 'undercover' | 'mrwhite'

export interface WordPack {
  id: string
  label: string
  emoji: string
  pairs: [string, string][]
  /** true pour les thèmes créés par l'utilisateur (modifiables et supprimables) */
  custom?: boolean
}

export interface GameSettings {
  themeIds: string[]
  undercoverCount: number
  includeMrWhite: boolean
}

export interface EliminationResult {
  player: Player
  winner: Winner | null
}

export interface GameState {
  phase: Phase
  settings: GameSettings
  playerNames: string[]
  players: Player[]
  turnOrder: string[]
  revealIndex: number
  roundNumber: number
  civilWord: string
  undercoverWord: string
  themeLabel: string
  lastElimination: EliminationResult | null
  winner: Winner | null
  votedOutId: string | null
}
