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
): { civil: string; undercover: string; themeLabel: string; themeImages: Record<string, string> } {
  const selected = allPacks.filter((p) => themeIds.includes(p.id) && p.pairs.length > 0)
  // filet de sécurité : si la sélection est vide (thème supprimé, données corrompues),
  // on retombe sur les thèmes intégrés plutôt que de planter.
  const pool = selected.length > 0 ? selected : wordPacks
  const chosenPack = pool[Math.floor(Math.random() * pool.length)]
  const [a, b] = chosenPack.pairs[Math.floor(Math.random() * chosenPack.pairs.length)]
  const common = { themeLabel: chosenPack.label, themeImages: chosenPack.images ?? {} }
  return Math.random() < 0.5
    ? { civil: a, undercover: b, ...common }
    : { civil: b, undercover: a, ...common }
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

/**
 * Ordre de passage d'une manche : tirage indépendant de l'ordre de révélation.
 *
 * Deux contraintes sur celui qui ouvre :
 * - ce n'est pas Mr. White, qui n'a aucun mot et devrait inventer un indice
 *   sans la moindre information ;
 * - ce n'est pas celui qui ouvrait la manche précédente, pour que la parole
 *   tourne vraiment d'une manche à l'autre.
 * La 1re contrainte prime : si aucun joueur ne coche les deux, on se contente
 * d'écarter Mr. White.
 */
export function makeTurnOrder(
  ids: string[],
  players: Player[],
  previousFirstId?: string | null,
): string[] {
  const order = shuffle(ids)
  if (order.length < 2) return order

  const roleById = new Map(players.map((p) => [p.id, p.role]))
  const isMrWhite = (id: string) => roleById.get(id) === 'mrwhite'
  const canOpen = (id: string) => !isMrWhite(id) && id !== previousFirstId

  if (canOpen(order[0])) return order

  const ideal = order.findIndex(canOpen)
  const swapWith = ideal !== -1 ? ideal : order.findIndex((id) => !isMrWhite(id))
  if (swapWith <= 0) return order // aucun remplaçant possible

  const next = [...order]
  ;[next[0], next[swapWith]] = [next[swapWith], next[0]]
  return next
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

/**
 * Undercover et Mr. White ne forment PAS une équipe : chacun joue pour son
 * propre camp. Un camp ne l'emporte donc que s'il pèse, à lui seul, autant que
 * tous les autres survivants réunis — éliminer un civil ne suffit plus à faire
 * gagner un imposteur tant que l'autre imposteur est encore en jeu.
 *
 * Quand les deux camps remplissent la condition en même temps (il ne reste plus
 * que des imposteurs, à égalité), personne n'a encore gagné : c'est le duel
 * final, un dernier vote départage.
 */
export function checkWinner(players: Player[]): Winner | null {
  const { civils, undercover, mrwhite } = aliveByRole(players)
  if (undercover === 0 && mrwhite === 0) return 'civils'

  const undercoverWins = undercover > 0 && undercover >= civils + mrwhite
  const mrWhiteWins = mrwhite > 0 && mrwhite >= civils + undercover
  if (undercoverWins && mrWhiteWins) return null
  if (undercoverWins) return 'undercover'
  if (mrWhiteWins) return 'mrwhite'
  return null
}

/** Plus aucun civil en vie, mais les deux camps d'imposteurs s'affrontent encore. */
export function isFinalDuel(players: Player[]): boolean {
  const { civils, undercover, mrwhite } = aliveByRole(players)
  return civils === 0 && undercover > 0 && mrwhite > 0
}

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 20

export function maxUndercoverFor(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2))
}

export function initialState(): GameState {
  return {
    phase: 'setup',
    settings: { themeIds: ['classique'], undercoverCount: 1, includeMrWhite: false, showImages: true },
    playerNames: ['', '', ''],
    players: [],
    turnOrder: [],
    revealIndex: 0,
    roundNumber: 1,
    civilWord: '',
    undercoverWord: '',
    themeLabel: '',
    themeImages: {},
    lastElimination: null,
    winner: null,
    votedOutId: null,
  }
}
