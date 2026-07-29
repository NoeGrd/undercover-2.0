import { useState } from 'react'
import type { Player } from '../types'

interface Props {
  players: Player[]
  onEliminate: (playerId: string) => void
}

export default function VoteScreen({ players, onEliminate }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const alive = players.filter((p) => p.alive)
  const selectedPlayer = alive.find((p) => p.id === selected)

  return (
    <div className="screen">
      <h1>Qui est démasqué ?</h1>
      <p>Mettez-vous d'accord à voix haute, puis désignez le joueur éliminé.</p>

      <div className="player-list">
        {alive.map((p) => (
          <div
            key={p.id}
            className={`player-row selectable ${selected === p.id ? 'selected' : ''}`}
            onClick={() => setSelected(p.id)}
          >
            <span className="player-avatar">{p.name.charAt(0).toUpperCase()}</span>
            <span className="player-name">{p.name}</span>
            {selected === p.id && <span>🎯</span>}
          </div>
        ))}
      </div>

      <div className="spacer" />
      <button
        className="btn btn-danger btn-block"
        disabled={!selectedPlayer}
        onClick={() => selectedPlayer && onEliminate(selectedPlayer.id)}
      >
        {selectedPlayer ? `Éliminer ${selectedPlayer.name}` : 'Sélectionne un joueur'}
      </button>
    </div>
  )
}
