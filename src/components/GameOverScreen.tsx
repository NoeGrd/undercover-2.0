import type { Player, Winner } from '../types'

interface Props {
  winner: Winner | null
  players: Player[]
  civilWord: string
  undercoverWord: string
  themeLabel: string
  onReplaySamePlayers: () => void
  onNewGame: () => void
}

const roleLabel: Record<string, string> = {
  civil: 'Civil',
  undercover: 'Undercover',
  mrwhite: 'Mr. White',
}

const winnerCopy: Record<Winner, { emoji: string; title: string }> = {
  civils: { emoji: '🏆', title: 'Les Civils gagnent !' },
  undercover: { emoji: '🕶️', title: 'Les Undercover gagnent !' },
  mrwhite: { emoji: '🎩', title: 'Mr. White gagne !' },
}

export default function GameOverScreen({
  winner,
  players,
  civilWord,
  undercoverWord,
  themeLabel,
  onReplaySamePlayers,
  onNewGame,
}: Props) {
  const copy = winner ? winnerCopy[winner] : { emoji: '🤝', title: 'Partie terminée' }

  return (
    <div className="screen">
      <div className="banner">
        <div className="emoji">{copy.emoji}</div>
        <h1 style={{ marginTop: 10 }}>{copy.title}</h1>
        <p style={{ marginTop: 10 }}>Thème : {themeLabel}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          <span className="word-pill">🟢 {civilWord}</span>
          <span className="word-pill">🔴 {undercoverWord}</span>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 14 }}>Tous les rôles</h2>
        <div className="player-list">
          {players.map((p) => (
            <div className="player-row" key={p.id}>
              <span className="player-avatar">{p.name.charAt(0).toUpperCase()}</span>
              <span className="player-name">
                {p.name}
                {!p.alive && <span style={{ color: 'var(--text-dim)' }}> (éliminé)</span>}
              </span>
              <span className={`role-tag ${p.role}`}>{roleLabel[p.role]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="spacer" />
      <button className="btn btn-primary btn-block" onClick={onReplaySamePlayers}>
        Nouvelle manche, mêmes joueurs
      </button>
      <button className="btn btn-secondary btn-block" onClick={onNewGame}>
        Nouvelle partie
      </button>
    </div>
  )
}
