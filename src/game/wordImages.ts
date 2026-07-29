/**
 * Récupération d'une image illustrant un mot (personnage, artiste, objet…).
 *
 * Les images ne sont pas embarquées dans l'app : elles sont cherchées sur
 * Wikipédia à la volée, puis mises en cache (localStorage pour l'URL, service
 * worker pour le fichier) afin de rester disponibles hors-ligne ensuite.
 */

const CACHE_KEY = 'undercover.wordImages.v1'
const LANGS = ['fr', 'en'] as const
/**
 * Largeur demandée à Wikipédia. On la demande au serveur plutôt que de réécrire
 * l'URL a posteriori : une taille bricolée à la main renvoie une 404 dès qu'elle
 * dépasse la largeur du fichier d'origine.
 */
const THUMB_SIZE = 400

/** URL trouvée, ou null si Wikipédia n'a rien pour ce mot (évite de rechercher en boucle). */
type ImageCache = Record<string, string | null>

let memoryCache: ImageCache | null = null

function loadCache(): ImageCache {
  if (memoryCache) return memoryCache
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    memoryCache = raw ? (JSON.parse(raw) as ImageCache) : {}
  } catch {
    memoryCache = {}
  }
  return memoryCache
}

function persistCache(): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache ?? {}))
  } catch {
    // stockage plein ou indisponible : le cache mémoire suffit pour la session
  }
}

function cacheKey(word: string): string {
  return word.trim().toLowerCase()
}

function absolute(url: string): string {
  return url.startsWith('//') ? `https:${url}` : url
}

/** Miniature d'une page, à la taille demandée au serveur. */
async function fromSummary(lang: string, title: string): Promise<string | null> {
  try {
    const url =
      `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
      `&prop=pageimages&piprop=thumbnail&pithumbsize=${THUMB_SIZE}&redirects=1` +
      `&titles=${encodeURIComponent(title)}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const pages = data?.query?.pages
    if (!pages) return null
    for (const key of Object.keys(pages)) {
      const source: unknown = pages[key]?.thumbnail?.source
      if (typeof source === 'string') return absolute(source)
    }
    return null
  } catch {
    return null
  }
}

/** Recherche plein texte, puis récupération de la miniature de la meilleure page. */
async function fromSearch(lang: string, query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://${lang}.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=1`,
    )
    if (!res.ok) return null
    const data = await res.json()
    const page = data?.pages?.[0]
    if (!page) return null
    // la miniature de recherche est minuscule : on repasse par la fiche pour une vraie image
    if (typeof page.key === 'string') {
      const better = await fromSummary(lang, page.key)
      if (better) return better
    }
    const thumb: unknown = page?.thumbnail?.url
    return typeof thumb === 'string' ? absolute(thumb) : null
  } catch {
    return null
  }
}

/**
 * Cherche une image pour un mot. Renvoie null si rien n'a été trouvé.
 * Le résultat (y compris l'absence de résultat) est mis en cache.
 */
export async function fetchWordImage(word: string): Promise<string | null> {
  const key = cacheKey(word)
  if (!key) return null

  const cache = loadCache()
  if (key in cache) return cache[key]

  let found: string | null = null
  for (const lang of LANGS) {
    found = (await fromSummary(lang, word)) ?? (await fromSearch(lang, word))
    if (found) break
  }

  cache[key] = found
  persistCache()
  return found
}

/** Image déjà connue pour ce mot, sans déclencher de requête réseau. */
export function peekWordImage(word: string): string | null | undefined {
  return loadCache()[cacheKey(word)]
}

/** Force l'URL associée à un mot (override manuel depuis l'éditeur de thèmes). */
export function setWordImage(word: string, url: string | null): void {
  const cache = loadCache()
  cache[cacheKey(word)] = url
  persistCache()
}

