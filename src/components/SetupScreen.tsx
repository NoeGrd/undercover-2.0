import type { GameSettings, WordPack } from '../types'
import { MAX_PLAYERS, MIN_PLAYERS, maxUndercoverFor } from '../game/logic'

interface Props {
  packs: WordPack[]
  playerNames: string[]
  settings: GameSettings
  onNamesChange: (names: string[]) => void
  onSettingsChange: (settings: Partial<GameSettings>) => void
  onStart: () => void
}

export default function SetupScreen({
  packs,
  playerNames,
  settings,
  onNamesChange,
  onSettingsChange,
  onStart,
}: Props) {
  const filledCount = playerNames.map((n) => n.trim()).filter(Boolean).length
  const maxUndercover = maxUndercoverFor(playerNames.length)
  const selectedPairCount = packs
    .filter((p) => settings.themeIds.includes(p.id))
    .reduce((sum, p) => sum + p.pairs.length, 0)
  const canStart =
    filledCount >= MIN_PLAYERS && filledCount === playerNames.length && selectedPairCount > 0

  function updateName(i: number, value: string) {
    const next = [...playerNames]
    next[i] = value
    onNamesChange(next)
  }

  function addPlayer() {
    if (playerNames.length >= MAX_PLAYERS) return
    onNamesChange([...playerNames, ''])
  }

  function removePlayer(i: number) {
    if (playerNames.length <= MIN_PLAYERS) return
    onNamesChange(playerNames.filter((_, idx) => idx !== i))
  }

  function toggleTheme(id: string) {
    const has = settings.themeIds.includes(id)
    const next = has ? settings.themeIds.filter((t) => t !== id) : [...settings.themeIds, id]
    onSettingsChange({ themeIds: next })
  }

  const allThemesSelected = packs.length > 0 && packs.every((p) => settings.themeIds.includes(p.id))

  function toggleAllThemes() {
    onSettingsChange({ themeIds: allThemesSelected ? [] : packs.map((p) => p.id) })
  }

  return (
    <div className="screen screen--with-tabs">
      <div className="brand">
        <span className="brand-mark">🕵️</span>
        <h1>Undercover</h1>
      </div>
      <p>Trouve les infiltrés avant qu'ils ne te démasquent.</p>

      <div className="card">
        <div className="row" style={{ marginBottom: 14 }}>
          <h2>Joueurs</h2>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            {filledCount}/{playerNames.length}
          </span>
        </div>
        <div className="player-list">
          {playerNames.map((name, i) => (
            <div className="field" key={i}>
              <span className="field-index">{i + 1}</span>
              <input
                type="text"
                placeholder={`Joueur ${i + 1}`}
                value={name}
                maxLength={20}
                onChange={(e) => updateName(i, e.target.value)}
              />
              {playerNames.length > MIN_PLAYERS && (
                <button className="icon-btn" onClick={() => removePlayer(i)} aria-label="Retirer">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {playerNames.length < MAX_PLAYERS && (
          <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }} onClick={addPlayer}>
            + Ajouter un joueur
          </button>
        )}
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 14 }}>
          <h2>Thèmes</h2>
          {/* avec une vingtaine de thèmes, tout cocher à la main est vite pénible */}
          <button className="btn btn-ghost btn-inline" onClick={toggleAllThemes}>
            {allThemesSelected ? 'Tout décocher' : 'Tout cocher'}
          </button>
        </div>
        <div className="chip-grid">
          {packs.map((pack) => (
            <button
              key={pack.id}
              className={`chip ${settings.themeIds.includes(pack.id) ? 'selected' : ''}`}
              onClick={() => toggleTheme(pack.id)}
            >
              <span>{pack.emoji}</span>
              <span>{pack.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 14 }}>Options</h2>
        <div className="stepper" style={{ marginBottom: 12 }}>
          <span>Undercover</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              disabled={settings.undercoverCount <= 1}
              onClick={() => onSettingsChange({ undercoverCount: Math.max(1, settings.undercoverCount - 1) })}
            >
              −
            </button>
            <span style={{ fontWeight: 700, minWidth: 12, textAlign: 'center' }}>{settings.undercoverCount}</span>
            <button
              disabled={settings.undercoverCount >= maxUndercover}
              onClick={() =>
                onSettingsChange({ undercoverCount: Math.min(maxUndercover, settings.undercoverCount + 1) })
              }
            >
              +
            </button>
          </div>
        </div>
        <div className="row" style={{ marginBottom: 12 }}>
          <span>Mr. White</span>
          <button
            className={`switch ${settings.includeMrWhite ? 'on' : ''}`}
            onClick={() => onSettingsChange({ includeMrWhite: !settings.includeMrWhite })}
            aria-label="Activer Mr. White"
          />
        </div>
        <div className="row">
          <span>
            Images
            <span style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)' }}>
              Illustre le mot pour les persos qu'on ne connaît pas
            </span>
          </span>
          <button
            className={`switch ${settings.showImages ? 'on' : ''}`}
            onClick={() => onSettingsChange({ showImages: !settings.showImages })}
            aria-label="Afficher les images"
          />
        </div>
      </div>

      <div className="spacer" />
      <button className="btn btn-primary btn-block" disabled={!canStart} onClick={onStart}>
        Commencer la partie
      </button>
    </div>
  )
}
