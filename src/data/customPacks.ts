import type { WordPack } from '../types'

const STORAGE_KEY = 'undercover.customPacks.v1'

function isValidPack(p: unknown): p is WordPack {
  if (!p || typeof p !== 'object') return false
  const c = p as Record<string, unknown>
  return typeof c.id === 'string' && typeof c.label === 'string' && Array.isArray(c.pairs)
}

export function loadCustomPacks(): WordPack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidPack).map((p) => ({
      ...p,
      emoji: p.emoji || '⭐',
      pairs: p.pairs.filter((pair) => Array.isArray(pair) && pair[0] && pair[1]),
    }))
  } catch {
    return []
  }
}

export function saveCustomPacks(packs: WordPack[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs))
  } catch {
    // quota dépassé ou stockage indisponible : on ignore silencieusement
  }
}

export function newPackId(): string {
  return `custom-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Transforme un collage brut en paires de mots.
 * Une paire par ligne, les deux mots séparés par / , ; | ou une tabulation.
 */
export function parseBulkPairs(text: string): [string, string][] {
  const pairs: [string, string][] = []
  for (const line of text.split('\n')) {
    const parts = line
      .split(/[/,;|\t]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length >= 2) pairs.push([parts[0], parts[1]])
  }
  return pairs
}
