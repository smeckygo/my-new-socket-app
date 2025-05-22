// src/context/PlayerProvider.tsx - Korrigálva (useEffect eltávolítva) (HOST/FRONTEND)

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'; // Importáljuk az useEffect-et
import { Player } from '../types'; // Importáljuk a Player típust
import { useSocket } from './SocketIOProvider'; // Importáljuk a useSocket hookot

// --- 1. A Játékos Állapotának Típusa ---
// Ez az állapot lehet Player objektum VAGY null (ha nincs bejelentkezve).
type PlayerContextState = Player | null;


// --- 2. A PlayerContext által biztosított érték típusa ---
interface PlayerContextType {
    player: PlayerContextState; // Az aktuális játékos állapota (Player vagy null)
    // <<< HIBA JAVÍTÁSA: A setPlayer függvény paramétere most már elfogad callbacket is >>>
    // Hasonlóan a React useState setter függvényéhez.
    setPlayer: React.Dispatch<React.SetStateAction<PlayerContextState>>;
    updatePlayer: (updates: Partial<Player>) => void; // Függvény a játékos részleges frissítéséhez
    clearPlayer: () => void; // Függvény a játékos állapotának null-ra állításához (kijelentkezés)
}

// --- 3. Kontextus Létrehozása ---
// Kezdeti érték undefined, ha nincs Provider
export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// --- 4. usePlayer Custom Hook ---
export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) { // useContext null helyett undefined-et ad vissza, ha nincs Provider
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};

// --- 5. Provider Komponens Props ---
interface PlayerProviderProps {
    children: ReactNode;
}

// --- 6. Provider Komponens ---
export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
    // A belső state, ami tárolja a játékos objektumot vagy null-t
    const [player, setPlayerState] = useState<PlayerContextState>(null);

    // Lekérjük a Socket.IO kapcsolat állapotát (ezt a PlayerProvider nem használja közvetlenül a player.status frissítésére)
    // const { isConnected, isAuthenticated } = useSocket(); // Eltávolítva, mivel a useEffect is eltávolításra került

    // Metódus a játékos objektum beállításához (most már a useState setter)
    // FIX: setPlayer most már a setPlayerState-re hivatkozik, ami már React.Dispatch típusú
    const setPlayer = setPlayerState;

    // Metódus a játékos részleges frissítéséhez
    const updatePlayer = (updates: Partial<Player>) => {
        setPlayerState((prev) => (prev ? { ...prev, ...updates } : prev));
    };

    // Metódus a játékos állapotának null-ra állításához (kijelentkezés)
    const clearPlayer = () => setPlayerState(null);


    // <<< ELTÁVOLÍTVA: useEffect a host saját státuszának frissítéséhez >>>
    // A felhasználó kérésére eltávolítva, mivel a host saját státuszának dinamikus frissítése
    // a PlayerProviderben nem szükséges a host-only alkalmazásban.
    // A kapcsolat állapotát (isConnected, isAuthenticated) a useSocket hookból kell lekérdezni.
    /*
    useEffect(() => {
        if (player) {
            let newStatus: Player['status'];

            console.log('[PlayerProvider] nézzük player:', player);
            if (isConnected && isAuthenticated) {
                newStatus = 'online';
            } else if (isConnected && !isAuthenticated) {
                newStatus = 'waiting_to_reconnect';
            } else {
                newStatus = 'left';
            }

            if (player.status !== newStatus) {
                console.log(`[PlayerProvider] Host status update: ${player.status} -> ${newStatus}`);
                setPlayerState(prev => prev ? { ...prev, status: newStatus } : null);
            }
        }
    }, [isConnected, isAuthenticated, player]);
    */


    // A context érték, amit a Provider biztosít
    const contextValue: PlayerContextType = {
        player,
        setPlayer,
        updatePlayer,
        clearPlayer,
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {children}
        </PlayerContext.Provider>
    );
};
