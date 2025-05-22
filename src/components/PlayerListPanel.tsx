// src/components/PlayerListPanel.tsx
import React from 'react';
import { useConnectedPlayers } from '../hooks/socketHandlers/useConnectedPlayers';

const PlayerListPanel: React.FC = () => {
    const { connectedPlayers } = useConnectedPlayers();

    return (
        <aside className="right-panel">
            <h3>Összes Játékos</h3>
            <div className="player-list-container">
                {connectedPlayers.length === 0 ? (
                    <p className="no-players-message">Nincsenek csatlakozott játékosok.</p>
                ) : (
                    connectedPlayers.map(player => (
                        <div
                            key={player.user_id} // 'player.id' helyett 'player.user_id'
                            className={`player-card status-${player.status ?? 'offline'}`}
                        >
                            <div className="player-card-avatar">
                                {(player.username?.charAt(0) ?? '?').toUpperCase()} // 'player.name' helyett 'player.username'
                            </div>
                            <div className="player-card-info">
                                <span className="player-card-name">{player.username}</span> // 'player.name' helyett 'player.username'
                                <span className="player-card-score">{player.score ?? 0} pont</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
};

export default PlayerListPanel;