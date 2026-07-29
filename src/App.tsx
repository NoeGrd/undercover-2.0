import { useEffect, useMemo, useReducer, useState } from 'react'
import type { WordPack } from './types'
import { reducer } from './game/reducer'
import { initialState } from './game/logic'
import { wordPacks } from './data/wordPacks'
import { loadCustomPacks, saveCustomPacks } from './data/customPacks'
import SetupScreen from './components/SetupScreen'
import ThemesScreen from './components/ThemesScreen'
import RevealScreen from './components/RevealScreen'
import DiscussScreen from './components/DiscussScreen'
import VoteScreen from './components/VoteScreen'
import MrWhiteGuessScreen from './components/MrWhiteGuessScreen'
import RoundResultScreen from './components/RoundResultScreen'
import GameOverScreen from './components/GameOverScreen'

type Tab = 'play' | 'themes'

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [customPacks, setCustomPacks] = useState<WordPack[]>(loadCustomPacks)
  const [tab, setTab] = useState<Tab>('play')

  const allPacks = useMemo(() => [...wordPacks, ...customPacks], [customPacks])

  useEffect(() => {
    saveCustomPacks(customPacks)
  }, [customPacks])

  // Un thème supprimé ne doit pas rester sélectionné dans les réglages.
  useEffect(() => {
    const known = new Set(allPacks.map((p) => p.id))
    const pruned = state.settings.themeIds.filter((id) => known.has(id))
    if (pruned.length !== state.settings.themeIds.length) {
      dispatch({ type: 'SET_SETTINGS', settings: { themeIds: pruned } })
    }
  }, [allPacks, state.settings.themeIds])

  function savePack(pack: WordPack) {
    setCustomPacks((prev) => {
      const exists = prev.some((p) => p.id === pack.id)
      return exists ? prev.map((p) => (p.id === pack.id ? pack : p)) : [...prev, pack]
    })
  }

  function deletePack(id: string) {
    setCustomPacks((prev) => prev.filter((p) => p.id !== id))
  }

  if (state.phase === 'setup') {
    return (
      <div className="app-shell">
        {tab === 'play' ? (
          <SetupScreen
            packs={allPacks}
            playerNames={state.playerNames}
            settings={state.settings}
            onNamesChange={(names) => dispatch({ type: 'SET_PLAYER_NAMES', names })}
            onSettingsChange={(settings) => dispatch({ type: 'SET_SETTINGS', settings })}
            onStart={() => dispatch({ type: 'START_GAME', packs: allPacks })}
          />
        ) : (
          <ThemesScreen customPacks={customPacks} onSave={savePack} onDelete={deletePack} />
        )}

        <nav className="tabbar">
          <button className={`tab ${tab === 'play' ? 'active' : ''}`} onClick={() => setTab('play')}>
            <span className="tab-icon">🎮</span>
            <span>Jouer</span>
          </button>
          <button
            className={`tab ${tab === 'themes' ? 'active' : ''}`}
            onClick={() => setTab('themes')}
          >
            <span className="tab-icon">📚</span>
            <span>Thèmes</span>
          </button>
        </nav>
      </div>
    )
  }

  switch (state.phase) {
    case 'reveal':
      return (
        <RevealScreen
          key={state.revealIndex}
          players={state.players}
          revealIndex={state.revealIndex}
          showImages={state.settings.showImages}
          themeImages={state.themeImages}
          onNext={() => dispatch({ type: 'REVEAL_NEXT' })}
        />
      )

    case 'discuss':
      return (
        <DiscussScreen
          players={state.players}
          turnOrder={state.turnOrder}
          roundNumber={state.roundNumber}
          onStartVote={() => dispatch({ type: 'START_VOTE' })}
        />
      )

    case 'vote':
      return (
        <VoteScreen players={state.players} onEliminate={(playerId) => dispatch({ type: 'ELIMINATE', playerId })} />
      )

    case 'mrwhiteGuess': {
      const player = state.players.find((p) => p.id === state.votedOutId)
      if (!player) return null
      return <MrWhiteGuessScreen player={player} onGuess={(guess) => dispatch({ type: 'MRWHITE_GUESS', guess })} />
    }

    case 'roundResult':
      if (!state.lastElimination) return null
      return (
        <RoundResultScreen
          elimination={state.lastElimination}
          hasWinner={state.winner !== null}
          onContinue={() => dispatch({ type: 'CONTINUE_ROUND' })}
          onShowGameOver={() => dispatch({ type: 'SHOW_GAME_OVER' })}
        />
      )

    case 'gameOver':
      return (
        <GameOverScreen
          winner={state.winner}
          players={state.players}
          civilWord={state.civilWord}
          undercoverWord={state.undercoverWord}
          themeLabel={state.themeLabel}
          showImages={state.settings.showImages}
          themeImages={state.themeImages}
          onReplaySamePlayers={() => dispatch({ type: 'REPLAY_SAME_PLAYERS', packs: allPacks })}
          onNewGame={() => dispatch({ type: 'RESET' })}
        />
      )

    default:
      return null
  }
}
