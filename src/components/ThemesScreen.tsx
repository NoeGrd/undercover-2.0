import { useState } from 'react'
import type { WordPack } from '../types'
import { wordPacks } from '../data/wordPacks'
import { newPackId, parseBulkPairs } from '../data/customPacks'

interface Props {
  customPacks: WordPack[]
  onSave: (pack: WordPack) => void
  onDelete: (id: string) => void
}

const EMOJI_SUGGESTIONS = ['🍥', '🎬', '🎤', '⚽', '🏆', '🎮', '🍔', '🐾', '🚗', '🌍', '📺', '⭐']

export default function ThemesScreen({ customPacks, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState<WordPack | null>(null)

  if (editing) {
    return (
      <PackEditor
        pack={editing}
        onCancel={() => setEditing(null)}
        onSave={(pack) => {
          onSave(pack)
          setEditing(null)
        }}
      />
    )
  }

  return (
    <div className="screen screen--with-tabs">
      <h1>Thèmes</h1>
      <p>Crée tes propres catégories. Elles apparaissent aussitôt dans l'écran de jeu.</p>

      <button
        className="btn btn-primary btn-block"
        onClick={() =>
          setEditing({ id: newPackId(), label: '', emoji: '⭐', pairs: [['', '']], custom: true })
        }
      >
        + Nouveau thème
      </button>

      <div className="card">
        <div className="row" style={{ marginBottom: 14 }}>
          <h2>Mes thèmes</h2>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{customPacks.length}</span>
        </div>

        {customPacks.length === 0 ? (
          <p style={{ fontSize: 14 }}>
            Aucun thème perso pour l'instant. Crée-en un pour ajouter tes propres mots.
          </p>
        ) : (
          <div className="player-list">
            {customPacks.map((pack) => (
              <div className="player-row" key={pack.id}>
                <span className="player-avatar">{pack.emoji}</span>
                <span className="player-name">
                  {pack.label}
                  <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>
                    {' '}
                    · {pack.pairs.length} paire{pack.pairs.length > 1 ? 's' : ''}
                  </span>
                </span>
                <button className="icon-btn" onClick={() => setEditing(pack)} aria-label="Modifier">
                  ✏️
                </button>
                <button
                  className="icon-btn"
                  onClick={() => {
                    if (confirm(`Supprimer le thème « ${pack.label} » ?`)) onDelete(pack.id)
                  }}
                  aria-label="Supprimer"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 14 }}>Thèmes intégrés</h2>
        <div className="player-list">
          {wordPacks.map((pack) => (
            <div className="player-row" key={pack.id}>
              <span className="player-avatar">{pack.emoji}</span>
              <span className="player-name">
                {pack.label}
                <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>
                  {' '}
                  · {pack.pairs.length} paires
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface EditorProps {
  pack: WordPack
  onSave: (pack: WordPack) => void
  onCancel: () => void
}

function PackEditor({ pack, onSave, onCancel }: EditorProps) {
  const [label, setLabel] = useState(pack.label)
  const [emoji, setEmoji] = useState(pack.emoji)
  const [pairs, setPairs] = useState<[string, string][]>(
    pack.pairs.length > 0 ? pack.pairs : [['', '']],
  )
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')

  const validPairs = pairs.filter(([a, b]) => a.trim() && b.trim())
  const canSave = label.trim().length > 0 && validPairs.length > 0

  function updatePair(index: number, side: 0 | 1, value: string) {
    setPairs(pairs.map((p, i) => (i === index ? (side === 0 ? [value, p[1]] : [p[0], value]) : p)))
  }

  function importBulk() {
    const parsed = parseBulkPairs(bulkText)
    if (parsed.length === 0) return
    const existing = pairs.filter(([a, b]) => a.trim() && b.trim())
    setPairs([...existing, ...parsed])
    setBulkText('')
    setBulkOpen(false)
  }

  return (
    <div className="screen screen--with-tabs">
      <div className="row">
        <button className="icon-btn" onClick={onCancel} aria-label="Retour">
          ← Retour
        </button>
      </div>

      <h1>{pack.label ? 'Modifier le thème' : 'Nouveau thème'}</h1>

      <div className="card">
        <h2 style={{ marginBottom: 14 }}>Nom & icône</h2>
        <div className="field" style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Ex : Perso de jeux vidéo"
            value={label}
            maxLength={30}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div className="emoji-row">
          {EMOJI_SUGGESTIONS.map((e) => (
            <button
              key={e}
              className={`emoji-btn ${emoji === e ? 'selected' : ''}`}
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 14 }}>
          <h2>Paires de mots</h2>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{validPairs.length} valide(s)</span>
        </div>
        <p style={{ fontSize: 13, marginBottom: 14 }}>
          À gauche le mot des civils, à droite celui des undercover. Deux mots proches mais
          distinguables.
        </p>

        <div className="player-list">
          {pairs.map((pair, i) => (
            <div className="pair-row" key={i}>
              <input
                type="text"
                placeholder="Mot civil"
                value={pair[0]}
                onChange={(e) => updatePair(i, 0, e.target.value)}
              />
              <span className="pair-sep">↔</span>
              <input
                type="text"
                placeholder="Mot undercover"
                value={pair[1]}
                onChange={(e) => updatePair(i, 1, e.target.value)}
              />
              <button
                className="icon-btn"
                onClick={() => setPairs(pairs.length > 1 ? pairs.filter((_, idx) => idx !== i) : [['', '']])}
                aria-label="Retirer la paire"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 12 }}
          onClick={() => setPairs([...pairs, ['', '']])}
        >
          + Ajouter une paire
        </button>
        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 8 }}
          onClick={() => setBulkOpen(!bulkOpen)}
        >
          📋 Importer en masse
        </button>

        {bulkOpen && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 13, marginBottom: 8 }}>
              Une paire par ligne, séparée par <strong>/</strong>, <strong>,</strong> ou{' '}
              <strong>;</strong>
            </p>
            <textarea
              className="bulk-textarea"
              rows={7}
              placeholder={'Naruto / Sasuke\nGoku / Vegeta\nLuffy / Zoro'}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <button
              className="btn btn-secondary btn-block"
              style={{ marginTop: 8 }}
              disabled={parseBulkPairs(bulkText).length === 0}
              onClick={importBulk}
            >
              Importer {parseBulkPairs(bulkText).length} paire(s)
            </button>
          </div>
        )}
      </div>

      <div className="spacer" />
      <button
        className="btn btn-primary btn-block"
        disabled={!canSave}
        onClick={() =>
          onSave({ id: pack.id, label: label.trim(), emoji, pairs: validPairs, custom: true })
        }
      >
        {canSave ? `Enregistrer (${validPairs.length} paires)` : 'Nom et 1 paire minimum'}
      </button>
    </div>
  )
}
