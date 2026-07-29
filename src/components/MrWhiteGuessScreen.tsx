import { useState } from 'react'
import type { Player } from '../types'

interface Props {
  player: Player
  onGuess: (guess: string) => void
}

export default function MrWhiteGuessScreen({ player, onGuess }: Props) {
  const [guess, setGuess] = useState('')

  return (
    <div className="screen">
      <h1>🎩 {player.name} est Mr. White !</h1>
      <p>Dernière chance : s'il devine le mot des civils, il gagne la partie sur-le-champ.</p>

      <div className="card">
        <input
          type="text"
          className="guess-input"
          placeholder="Devine le mot des civils..."
          value={guess}
          autoFocus
          onChange={(e) => setGuess(e.target.value)}
        />
      </div>

      <div className="spacer" />
      <button className="btn btn-primary btn-block" disabled={!guess.trim()} onClick={() => onGuess(guess)}>
        Valider la réponse
      </button>
      <button className="btn btn-ghost btn-block" onClick={() => onGuess('')}>
        Passer (ne pas deviner)
      </button>
    </div>
  )
}
