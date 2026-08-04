import type { GameSettings, GameState, WordPack } from '../types'
import { assignRoles, checkWinner, initialState, makeTurnOrder, pickWordPair } from './logic'

export type Action =
  | { type: 'SET_PLAYER_NAMES'; names: string[] }
  | { type: 'SET_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'START_GAME'; packs: WordPack[] }
  | { type: 'REVEAL_CURRENT' }
  | { type: 'REVEAL_NEXT' }
  | { type: 'START_VOTE' }
  | { type: 'ELIMINATE'; playerId: string }
  | { type: 'MRWHITE_GUESS'; guess: string }
  | { type: 'CONTINUE_ROUND' }
  | { type: 'SHOW_GAME_OVER' }
  | { type: 'REPLAY_SAME_PLAYERS'; packs: WordPack[] }
  | { type: 'RESET' }

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_PLAYER_NAMES':
      return { ...state, playerNames: action.names }

    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }

    case 'START_GAME': {
      const names = state.playerNames.map((n) => n.trim()).filter(Boolean)
      const { civil, undercover, themeLabel, themeImages } = pickWordPair(
        state.settings.themeIds,
        action.packs,
      )
      const players = assignRoles(names, state.settings, civil, undercover)
      return {
        ...state,
        players,
        turnOrder: makeTurnOrder(players.map((p) => p.id), players),
        civilWord: civil,
        undercoverWord: undercover,
        themeLabel,
        themeImages,
        phase: 'reveal',
        revealIndex: 0,
        roundNumber: 1,
        lastElimination: null,
        winner: null,
        votedOutId: null,
      }
    }

    case 'REVEAL_NEXT': {
      const players = state.players.map((p, i) => (i === state.revealIndex ? { ...p, hasRevealed: true } : p))
      const nextIndex = state.revealIndex + 1
      return {
        ...state,
        players,
        revealIndex: nextIndex,
        phase: nextIndex >= players.length ? 'discuss' : 'reveal',
      }
    }

    case 'START_VOTE':
      return { ...state, phase: 'vote', votedOutId: null }

    case 'ELIMINATE': {
      const player = state.players.find((p) => p.id === action.playerId)
      if (!player) return state
      const players = state.players.map((p) => (p.id === action.playerId ? { ...p, alive: false } : p))
      if (player.role === 'mrwhite') {
        return { ...state, players, votedOutId: action.playerId, phase: 'mrwhiteGuess' }
      }
      const winner = checkWinner(players)
      return {
        ...state,
        players,
        votedOutId: action.playerId,
        lastElimination: { player: { ...player, alive: false }, winner },
        winner,
        phase: 'roundResult',
      }
    }

    case 'MRWHITE_GUESS': {
      const player = state.players.find((p) => p.id === state.votedOutId)
      if (!player) return state
      const correct = normalize(action.guess) === normalize(state.civilWord)
      if (correct) {
        return {
          ...state,
          lastElimination: { player, winner: 'mrwhite' },
          winner: 'mrwhite',
          phase: 'roundResult',
        }
      }
      const winner = checkWinner(state.players)
      return {
        ...state,
        lastElimination: { player, winner },
        winner,
        phase: 'roundResult',
      }
    }

    case 'CONTINUE_ROUND': {
      const aliveIds = state.players.filter((p) => p.alive).map((p) => p.id)
      return {
        ...state,
        // chaque manche repart sur un ordre entièrement retiré au sort,
        // sans redonner l'ouverture à celui qui parlait déjà en premier
        turnOrder: makeTurnOrder(aliveIds, state.players, state.turnOrder[0]),
        roundNumber: state.roundNumber + 1,
        phase: 'discuss',
        lastElimination: null,
        votedOutId: null,
      }
    }

    case 'SHOW_GAME_OVER':
      return { ...state, phase: 'gameOver' }

    case 'REPLAY_SAME_PLAYERS': {
      const names = state.players.map((p) => p.name)
      const { civil, undercover, themeLabel, themeImages } = pickWordPair(
        state.settings.themeIds,
        action.packs,
      )
      const players = assignRoles(names, state.settings, civil, undercover)
      return {
        ...state,
        players,
        turnOrder: makeTurnOrder(players.map((p) => p.id), players),
        civilWord: civil,
        undercoverWord: undercover,
        themeLabel,
        themeImages,
        phase: 'reveal',
        revealIndex: 0,
        roundNumber: 1,
        lastElimination: null,
        winner: null,
        votedOutId: null,
      }
    }

    case 'RESET':
      return initialState()

    default:
      return state
  }
}

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}
