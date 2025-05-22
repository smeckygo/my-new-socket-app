// src/components/LobbyPage.tsx - Debug Logokkal (Végleges) (HOST/FRONTEND)

import React from 'react';
import TopBar from './TopBar';
import { useMatch } from '../context/MatchProvider';
import { useSocket } from '../context/SocketIOProvider';
import { usePlayer } from '../context/PlayerProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface LobbyPageProps {
    onGameStart: () => void;
}

const LobbyPage: React.FC<LobbyPageProps> = ({ onGameStart }) => {
    const { matchState } = useMatch();
    const { player } = usePlayer();
    const { emitAction } = useSocket();

    const { gameId, hostId, status, players } = matchState;

    const isCurrentUserHost = player?.user_id === hostId;

    // --- ÚJ DEBUG LOGOK ---
    console.log(`[LobbyPage Render] PLAYER ID: ${player?.user_id}`);
    console.log(`[LobbyPage Render] MATCHSTATE HOST ID: ${hostId}`);
    console.log(`[LobbyPage Render] isCurrentUserHost calculated: ${isCurrentUserHost}`);
    console.log(`[LobbyPage Render] MatchState Status: ${status}`);
    console.log(`[LobbyPage Render] Player object from context:`, player);
    console.log(`[LobbyPage Render] MatchState object from context:`, matchState);
    // --- VÉGE ÚJ DEBUG LOGOK ---

    const readyPlayersCount = players.filter(p => p.status === 'ready').length;
    const allPlayersReady = players.length > 0 && readyPlayersCount === players.length;

    const handleStartGame = () => {
        console.log(`[LobbyPage] Játék indítása gomb megnyomva! Game ID: ${gameId}`);
        if (!isCurrentUserHost) {
            console.warn('[LobbyPage] Csak a host indíthatja a játékot.');
            return;
        }
        if (!allPlayersReady) {
            console.warn('[LobbyPage] Nem mindenki áll készen a játék indításához.');
            return;
        }
        if (status !== 'waiting') {
            console.warn('[LobbyPage] A játék nem "waiting" státuszban van.');
            return;
        }
        emitAction('quiz/start', { gameId: gameId });
    };

    const handlePlayerReady = () => {
        console.log(`[LobbyPage] Készen állok gomb megnyomva! Player ID: ${player?.user_id}`);
        emitAction('player/setReady', { gameId: gameId, userId: player?.user_id, isReady: true });
    };

    return (
        <div className="main-area-wrapper">
            <main className="main-content-area">
                <TopBar />
                <section className="lobby-content">
                    <h2>Játék várószoba</h2>
                    {isCurrentUserHost && gameId && (
                        <div className="game-code">
                            <p>Játék kód:</p>
                            <span className="code-display">{gameId}</span>
                        </div>
                    )}
                    {!isCurrentUserHost && (
                        <div className="waiting-message">
                            <p>Csatlakoztál a játékhoz. Várakozás a Hostra és a többi játékosra...</p>
                        </div>
                    )}
                    <div className="joined-players-list">
                        <h3>Játékosok ({readyPlayersCount}/{players.length} készen áll)</h3>
                        <ul>
                            {players.map(p => (
                                <li key={p.user_id}>
                                    {p.username} {p.status === 'ready' && <FontAwesomeIcon icon={faCheckCircle} className="ready-icon" />}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {isCurrentUserHost ? (
                        <button
                            className="start-game-button"
                            disabled={!allPlayersReady || status !== 'waiting'}
                            onClick={handleStartGame}
                        >
                            Játék indítása
                        </button>
                    ) : (
                        null
                    )}
                </section>
            </main>
        </div>
    );
}

export default LobbyPage;
