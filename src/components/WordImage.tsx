import { useEffect, useState } from 'react'
import { fetchWordImage, peekWordImage } from '../game/wordImages'

/**
 * Charge (et met en cache) l'image illustrant un mot.
 * `override` court-circuite la recherche Wikipédia.
 */
export function useWordImage(word: string | null, override?: string) {
  const initial = word && !override ? peekWordImage(word) : undefined
  const [url, setUrl] = useState<string | null>(override ?? initial ?? null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!word) {
      setUrl(null)
      return
    }
    if (override) {
      setUrl(override)
      return
    }
    const known = peekWordImage(word)
    if (known !== undefined) {
      setUrl(known)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchWordImage(word).then((found) => {
      if (cancelled) return
      setUrl(found)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [word, override])

  return { url, loading }
}

interface Props {
  word: string | null
  override?: string
  /** hauteur de la vignette, en px */
  height?: number
  className?: string
}

export default function WordImage({ word, override, height = 180, className }: Props) {
  const { url, loading } = useWordImage(word, override)

  if (!word) return null

  if (loading) {
    return <div className={`word-image word-image--loading ${className ?? ''}`} style={{ height }} />
  }
  if (!url) return null

  return (
    <img
      className={`word-image ${className ?? ''}`}
      style={{ height }}
      src={url}
      alt={word}
      loading="eager"
      decoding="async"
    />
  )
}
