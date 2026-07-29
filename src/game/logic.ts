import type { GameSettings, GameState, Player, Role, Winner, WordPack } from '../types'
import { wordPacks } from '../data/wordPacks'

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickWordPair(
  themeIds: string[],
  allPacks: WordPack[],
): { civil: string; undercover: string; themeLabel: string } {
  const selected = allPacks.filter((p) => themeIds.includes(p.id) && p.pairs.length > 0)
  // filet de sécurité : si la sélection est vide (thème supprimé, données corrompues),
  // on retombe sur les thèmes intégrés plutôt que de planter.
  const pool = selected.length > 0 ? selected : wordPacks
  const chosenPack = pool[Math.floor(Math.random() * pool.length)]
  const [a, b] = chosenPack.pairs[Math.floor(Math.random() * chosenPack.pairs.length)]
  return Math.random() < 0.5
    ? { civil: a, undercover: b, themeLabel: chosenPack.label }
    : { civil: b, undercover: a, themeLabel: chosenPack.label }
}

export function assignRoles(names: string[], settings: GameSettings, civilWord: string, undercoverWord: string): Player[] {
  const shuffledNames = shuffle(names)
  const roles: Role[] = []
  for (let i = 0; i < settings.undercoverCount; i++) roles.push('undercover')
  if (settings.includeMrWhite) roles.push('mrwhite')
  while (roles.length < shuffledNames.length) roles.push('civil')
  const shuffledRoles = shuffle(roles)

  return shuffledNames.map((name, i) => {
    const role = shuffledRoles[i]
    const word = role === 'civil' ? civilWord : role === 'undercover' ? undercoverWord : null
    return {
      id: `p${i}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      role,
      word,
      alive: true,
      hasRevealed: false,
    }
  })
}

export function aliveByRole(players: Player[]) {
  const alive = players.filter((p) => p.alive)
  return {
    civils: alive.filter((p) => p.role === 'civil').length,
    undercover: alive.filter((p) => p.role === 'undercover').length,
    mrwhite: alive.filter((p) => p.role === 'mrwhite').length,
    alive,
  }
}

export function checkWinner(players: Player[]): Winner | null {
  const { civils, undercover, mrwhite } = aliveByRole(players)
  if (undercover === 0 && mrwhite === 0) return 'civils'
  if (undercover + mrwhite >= civils) return undercover > 0 ? 'undercover' : 'mrwhite'
  return null
}

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 20

export function maxUndercoverFor(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2))
}

export function initialState(): GameState {
  return {
    phase: 'setup',
    settings: { themeIds: ['classique'], undercoverCount: 1, includeMrWhite: false },
    playerNames: ['', '', ''],
    players: [],
    turnOrder: [],
    revealIndex: 0,
    roundNumber: 1,
    civilWord: '',
    undercoverWord: '',
    themeLabel: '',
    lastElimination: null,
    winner: null,
    votedOutId: null,
  }
}
