import type { Player } from '../types'

interface Props {
  players: Player[]
  turnOrder: string[]
  roundNumber: number
  onStartVote: () => void
}

export default function DiscussScreen({ players, turnOrder, roundNumber, onStartVote }: Props) {
  const byId = new Map(players.map((p) => [p.id, p]))
  const ordered = turnOrder.map((id) => byId.get(id)).filter((p): p is Player => !!p)

  return (
    <div className="screen">
      <h1>Manche {roundNumber}</h1>
      <p>
        Chacun donne, à tour de rôle, un indice sur son mot. Discutez, puis lancez le vote quand vous êtes prêts à
        éliminer un suspect.
      </p>

      <div className="card">
        <h2 style={{ marginBottom: 14 }}>Ordre de passage</h2>
        <div className="player-list">
          {ordered.map((p, i) => (
            <div className="player-row" key={p.id}>
              <span className="player-avatar">{i + 1}</span>
              <span className="player-name">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="spacer" />
      <button className="btn btn-primary btn-block" onClick={onStartVote}>
        Lancer le vote
      </button>
    </div>
  )
}
