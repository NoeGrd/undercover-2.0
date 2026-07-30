import { useState } from 'react'
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
  const [revealed, setRevealed] = useState(false)
  const [wordShown, setWordShown] = useState(false)
  const { player, winner } = elimination
  const mrWhiteGuessedRight = player.role === 'mrwhite' && winner === 'mrwhite'
  const mrWhiteGuessedWrong = player.role === 'mrwhite' && winner !== 'mrwhite'

  return (
    <div className="screen">
      <div className="banner">
        <div className="emoji">{revealed && mrWhiteGuessedRight ? '🎩' : '🗳️'}</div>
        <h2 style={{ marginTop: 10 }}>
          {player.name} {revealed ? 'était...' : 'a été éliminé'}
        </h2>

        {revealed ? (
          <>
            <div className={`role-tag ${player.role}`} style={{ display: 'inline-block', marginTop: 12 }}>
              {roleLabel[player.role]}
            </div>
            {mrWhiteGuessedRight && <p style={{ marginTop: 14 }}>Et il a deviné le bon mot des civils !</p>}
            {mrWhiteGuessedWrong && <p style={{ marginTop: 14 }}>Il s'est trompé, ce n'était pas le bon mot.</p>}
            {player.role !== 'mrwhite' && player.word && (
              <div style={{ marginTop: 16 }}>
                <p style={{ marginBottom: 8 }}>Son mot était</p>
                <button
                  className={`word-hidden ${wordShown ? 'shown' : ''}`}
                  onClick={() => setWordShown(true)}
                  aria-label={wordShown ? player.word : 'Appuie pour voir le mot'}
                >
                  {player.word}
                </button>
                {!wordShown && (
                  <p style={{ marginTop: 8, fontSize: 13 }}>👆 Appuie pour découvrir le mot</p>
                )}
              </div>
            )}
          </>
        ) : (
          <p style={{ marginTop: 14 }}>Roulement de tambour...</p>
        )}
      </div>

      <div className="spacer" />

      {!revealed ? (
        <button className="btn btn-primary btn-block" onClick={() => setRevealed(true)}>
          Révéler son rôle
        </button>
      ) : hasWinner ? (
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
