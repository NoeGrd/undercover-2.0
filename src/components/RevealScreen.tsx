import { useState } from 'react'
import type { Player } from '../types'

interface Props {
  players: Player[]
  revealIndex: number
  onNext: () => void
}

export default function RevealScreen({ players, revealIndex, onNext }: Props) {
  const [showing, setShowing] = useState(false)
  const [hasPeeked, setHasPeeked] = useState(false)
  const player = players[revealIndex]
  if (!player) return null

  const isMrWhite = player.role === 'mrwhite'

  return (
    <div className="screen">
      <div className="progress-dots">
        {players.map((_, i) => (
          <span key={i} className={i < revealIndex ? 'done' : ''} />
        ))}
      </div>

      <h1 style={{ textAlign: 'center' }}>Passe le téléphone à</h1>
      <h2 style={{ textAlign: 'center', color: 'var(--accent)', fontSize: 26 }}>{player.name}</h2>
      <p style={{ textAlign: 'center' }}>
        Assure-toi que personne d'autre ne regarde l'écran avant d'appuyer.
      </p>

      <div
        className={`reveal-card ${showing ? (isMrWhite ? 'mrwhite' : 'showing') : ''}`}
        onMouseDown={() => {
          setShowing(true)
          setHasPeeked(true)
        }}
        onMouseUp={() => setShowing(false)}
        onMouseLeave={() => setShowing(false)}
        onTouchStart={(e) => {
          e.preventDefault()
          setShowing(true)
          setHasPeeked(true)
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          setShowing(false)
        }}
      >
        {showing ? (
          isMrWhite ? (
            <div>
              <div className="reveal-word">Tu es Mr. White 🎩</div>
              <p style={{ marginTop: 10 }}>Tu n'as aucun mot. Bluffe pour deviner celui des civils !</p>
            </div>
          ) : (
            <div>
              <div className="reveal-hint" style={{ marginBottom: 10 }}>
                Ton mot est
              </div>
              <div className="reveal-word">{player.word}</div>
            </div>
          )
        ) : (
          <div className="reveal-hint">👆 Appuie et maintiens pour voir ton mot</div>
        )}
      </div>

      <button className="btn btn-primary btn-block" disabled={!hasPeeked} onClick={onNext}>
        J'ai vu, joueur suivant
      </button>
    </div>
  )
}
