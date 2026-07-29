import type { EliminationResult } from '../types'

interface Props {
  elimination: EliminationResult
  hasWinner: boolean
  onContinue: () => void
  onShowGameOver: () => void
}

const roleLabel: Record<string, string> = {
  civil: 'Civil',
  undercover: 'Undercover',
  mrwhite: 'Mr. White',
}

export default function RoundResultScreen({ elimination, hasWinner, onContinue, onShowGameOver }: Props) {
  const { player, winner } = elimination
  const mrWhiteGuessedRight = player.role === 'mrwhite' && winner === 'mrwhite'
  const mrWhiteGuessedWrong = player.role === 'mrwhite' && winner !== 'mrwhite'

  return (
    <div className="screen">
      <div className="banner">
        <div className="emoji">{mrWhiteGuessedRight ? '🎩' : '🗳️'}</div>
        <h2 style={{ marginTop: 10 }}>{player.name} était...</h2>
        <div className={`role-tag ${player.role}`} style={{ display: 'inline-block', marginTop: 10 }}>
          {roleLabel[player.role]}
        </div>
        {mrWhiteGuessedRight && <p style={{ marginTop: 14 }}>Et il a deviné le bon mot des civils !</p>}
        {mrWhiteGuessedWrong && <p style={{ marginTop: 14 }}>Il s'est trompé, ce n'était pas le bon mot.</p>}
        {player.role !== 'mrwhite' && player.word && (
          <p style={{ marginTop: 14 }}>
            Son mot était <strong style={{ color: 'var(--text)' }}>{player.word}</strong>
          </p>
        )}
      </div>

      <div className="spacer" />
      {hasWinner ? (
        <button className="btn btn-primary btn-block" onClick={onShowGameOver}>
          Voir le résultat final
        </button>
      ) : (
        <button className="btn btn-primary btn-block" onClick={onContinue}>
          Manche suivante
        </button>
      )}
    </div>
  )
}
