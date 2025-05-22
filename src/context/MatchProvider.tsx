// src/context/MatchProvider.tsx - Host Alkalmazáshoz (Korrigálva) (HOST/FRONTEND)

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useMemo,
} from 'react';

// Importáljuk a useSocket hookot a Socket.IO metódusokhoz
import { useSocket } from './SocketIOProvider'; // Győdj meg a helyes elérési útról!

// Importáljuk az összes szükséges típust a types.ts-ből
import {
    GameStateSnapshot, // A teljes meccs állapot snapshot, amit a backend küld
    Player, // A meccsben résztvevő játékosok listájához
    Question, // Az aktuális kérdéshez
    UserStatusUpdatePayload, // Játékos státusz frissítésekhez
    // Megjegyzés: A MatchState interfészt is itt definiáljuk, ha nem akarjuk a types.ts-be tenni.
    // Ha a types.ts-be teszed, akkor innen törölni kell, és importálni.
} from '../types'; // Győdj meg a helyes elérési útról és az exportált típusokról!


// --- 1. A Meccs Állapotának Típusa (HOST szemszögéből) ---
// Ez az interfész írja le a MatchProvider által tárolt teljes meccs állapotot.
// Ez az állapot a HOST számára releváns adatokat tartalmazza a meccsről.
export interface MatchState {
    // Alap meccs adatok
    gameId: string | null; // A meccs egyedi azonosítója (a host által létrehozott kód)
    hostId: string | null; // A meccs hostjának user ID-ja (ez a jelenlegi felhasználó ID-ja kell legyen)
    status: 'idle' | 'waiting' | 'active' | 'ended'; // A meccs aktuális státusza

    // Meccsben résztvevő JÁTÉKOSOK listája (akiket a host lát és kezel)
    // Ezek a játékosok a mobil kliensekről csatlakoznak.
    players: Player[]; // Feltételezve, hogy a Player interfész tartalmazza a user_id, username, status, score, isHost mezőket

    // Kérdés adatok (ha aktív a meccs)
    currentQuestion: Question | null;
    currentQuestionIndex: number; // Az aktuális kérdés indexe a meccsben (0-tól kezdve)

    // Frontend specifikus állapotok
    isLoadingMatch: boolean; // Jelzi, ha a frontend betölti a meccs állapotát (pl. snapshot fogadása)
    error: string | null; // Hibák tárolása

    // ... adj hozzá minden más releváns meccs adatot ide ...
    // pl: gameSettings: GameSettings | null;
    // pl: timerState: TimerState | null;
}

// --- Kezdeti Meccs Állapot ---
const initialMatchState: MatchState = {
    gameId: null,
    hostId: null,
    status: 'idle',
    players: [],
    currentQuestion: null,
    currentQuestionIndex: -1,
    isLoadingMatch: false,
    error: null,
};


// --- 2. Kontextus Értékének Típusa ---
// Ez írja le a useMatch hook által visszaadott értéket.
interface MatchContextType {
    matchState: MatchState; // A meccs aktuális állapota
    setMatchState: React.Dispatch<React.SetStateAction<MatchState>>; // A setMatchState függvény
    // Opcionális: Metódusok a meccs állapotának frontendről történő módosítására
    // (bár a legtöbb módosítást a backendről érkező Socket üzenetek váltják ki)
    // setPlayerReady: (isReady: boolean) => void; // Példa: játékos ready státuszának beállítása (ez emitAction-t hívna)
    // submitAnswer: (questionId: string, answerId: string) => void; // Példa: válasz küldése (ez emitAction-t hívna)
}

// --- 3. Kontextus Létrehozása ---
// Kezdeti értékek a hook használata előtti állapotra
export const MatchContext = createContext<MatchContextType>({
    matchState: initialMatchState,
    setMatchState: (() => {}) as React.Dispatch<React.SetStateAction<MatchState>>, // Üres függvényként inicializáljuk
    // Opcionális metódusok kezdeti értékei
    // setPlayerReady: (() => {}) as any,
    // submitAnswer: (() => {}) as any,
});


// --- 4. useMatch Custom Hook ---
export const useMatch = (): MatchContextType => {
    const context = useContext(MatchContext);
    if (context === undefined) { // useContext null helyett undefined-et ad vissza, ha nincs Provider
        throw new Error('useMatch must be used within a MatchProvider');
    }
    return context;
};


// --- 5. Provider Komponens Props ---
interface MatchProviderProps {
    children: ReactNode;
}

// --- 6. Provider Komponens ---
export const MatchProvider: React.FC<MatchProviderProps> = ({ children }) => {
    // A meccs állapotát egy useState hook kezeli
    const [matchState, setMatchState] = useState<MatchState>(initialMatchState);

    // Lekérjük a szükséges Socket.IO metódusokat a useSocket hookból
    const { socket, isConnected, onActionResponse, onServerAction } = useSocket();


    // --- useEffect hook a Socket.IO eseményfigyelők beállítására ---
    // Ezek a figyelők a backendről érkező meccs állapot frissítéseket kezelik.
    useEffect(() => {
        console.log('[MatchProvider] useEffect running...');

        // Csak akkor állítunk be figyelőket, ha van socket
        if (!socket) {
            console.log('[MatchProvider] useEffect: No socket, skipping listener setup.');
            return;
        }
        console.log(`[MatchProvider] useEffect: Setting up match state listeners for socket ID: ${socket.id}`);


        // --- <<< FIGYELŐ: Meccs Állapot Pillanatkép (Snapshot) >>> ---
        // Ezt a backend küldi csatlakozáskor/újracsatlakozáskor ('Response/game/stateSnapshot' type)
        // A hostnak szüksége van erre, hogy lássa a meccs aktuális állapotát.
        const cleanupSnapshotListener = onActionResponse('Response/game/stateSnapshot', (snapshot: GameStateSnapshot) => {
            console.log('[MatchProvider] Received game state snapshot:', snapshot);
            // Frissítjük a teljes meccs állapotot a bejövő snapshot-tal
            setMatchState(prev => ({
                ...prev, // Megtartjuk a korábbi frontend-specifikus állapotokat, ha vannak
                gameId: snapshot.gameId,
                hostId: snapshot.hostId,
                status: snapshot.status,
                players: snapshot.players, // A host látja a játékosok listáját
                currentQuestion: snapshot.currentQuestion,
                currentQuestionIndex: snapshot.currentQuestionIndex,
                isLoadingMatch: false, // Befejeződött a betöltés
                error: null, // Töröljük az esetleges hibát
                // ... frissíts minden más mezőt a snapshotból ...
            }));
            console.log('[MatchProvider] Match state updated with snapshot.');
        });


        // --- <<< FIGYELŐ: Játékos Státusz Frissítés (a host számára) >>> ---
        // Ezt a backend küldi, ha egy játékos státusza változik ('user/statusUpdate' type)
        // A hostnak látnia kell ezeket a változásokat a lobbyban/játékban.
        const cleanupPlayerStatusListener = onServerAction('user/statusUpdate', (payload: UserStatusUpdatePayload) => {
            console.log('[MatchProvider] Received player status update (for host display):', payload);
            // Frissítjük a játékoslistát a bejövő adatok alapján
            setMatchState(prev => {
                // Keresd meg a játékost a listában
                const existingPlayerIndex = prev.players.findIndex(p => p.user_id === payload.userId);

                let updatedPlayers;

                if (existingPlayerIndex > -1) {
                    // Ha a játékos már létezik, frissítsd a státuszát és nevét
                    updatedPlayers = prev.players.map((player, index) =>
                        index === existingPlayerIndex ? { ...player, status: payload.status, username: payload.name } : player // Frissítjük a státuszt és username-et
                    );
                    console.log(`[MatchProvider] Player ${payload.userId} status updated to ${payload.status}.`);

                } else {
                    // Ha a játékos még nincs a listában, és a státusz 'joined' vagy 'reconnected', add hozzá
                    if (payload.status === 'joined' || payload.status === 'reconnected') {
                        // Hozzáadjuk az új játékost alapértelmezett értékekkel
                        const newPlayer: Player = {
                            user_id: payload.userId,
                            username: payload.name,
                            status: payload.status,
                            score: 0, // Alapértelmezett pontszám (ezt a host is látja)
                            isHost: false, // Ez a játékos, nem a host
                        };
                        updatedPlayers = [...prev.players, newPlayer];
                        console.log(`[MatchProvider] New player ${payload.userId} added with status ${payload.status}.`);

                    } else {
                        // Ha a játékos nincs a listában, és a státusz nem 'joined' vagy 'reconnected', ne csinálj semmit a listával
                        updatedPlayers = prev.players;
                        console.log(`[MatchProvider] Player ${payload.userId} not found in list, and status is ${payload.status}. No action taken.`);
                    }
                }


                return {
                    ...prev,
                    players: updatedPlayers, // Használd a frissített játékoslistát
                };
            });
            console.log('[MatchProvider] Match state updated based on player status.');
        });


        // --- <<< FIGYELŐ: Új Kérdés Érkezése >>> ---
        // Ezt a backend küldi, ha új kérdés jön ('question/new' type)
        // A hostnak látnia kell az új kérdést.
        const cleanupNewQuestionListener = onServerAction('question/new', (payload: { question: Question; questionIndex: number }) => {
            console.log('[MatchProvider] Received new question:', payload);
            setMatchState(prev => ({
                ...prev,
                currentQuestion: payload.question,
                currentQuestionIndex: payload.questionIndex,
                // ... esetleg timer reset logika ...
            }));
            console.log('[MatchProvider] Match state updated with new question.');
        });


        // --- <<< FIGYELŐ: Meccs Státusz Váltás (pl. 'active', 'ended') >>> ---
        // Ezt a backend küldheti, ha a meccs státusza változik ('game/stateUpdate' type)
        // A hostnak látnia kell a meccs státuszát.
        const cleanupMatchStateUpdateListener = onServerAction('game/stateUpdate', (payload: { gameId: string; status: 'waiting' | 'active' | 'ended' }) => {
            console.log('[MatchProvider] Received match state update:', payload);
            if (matchState.gameId === payload.gameId) { // Csak ha az aktuális meccsünk státusza változik
                setMatchState(prev => ({
                    ...prev,
                    status: payload.status,
                    // ... esetleg started_at vagy ended_at frissítés ...
                }));
                console.log(`[MatchProvider] Match status updated to ${payload.status}.`);
            }
        });


        // --- Cleanup ---
        return () => {
            console.log('--- MatchProvider cleanup running ---');
            // Szedjük le az összes figyelőt a cleanup függvényekkel
            console.log('Cleaning up match state listeners...');
            cleanupSnapshotListener();
            cleanupPlayerStatusListener();
            cleanupNewQuestionListener();
            cleanupMatchStateUpdateListener();
            // ... szedd le az összes többi meccs specifikus figyelőt ...

            console.log('--- MatchProvider cleanup finished ---');
        };

        // Függőségek: Csak akkor fusson újra az effekt, ha a socket változik,
        // vagy a custom onActionResponse/onServerAction metódusok (amik useCallback-kel stabilizáltak).
    }, [socket, onActionResponse, onServerAction]); // Add other custom methods used


    // --- Kontextus Érték (memoizálva a felesleges render elkerülésére) ---
    const contextValue = useMemo(() => ({
        matchState, // A meccs aktuális állapota
        setMatchState, // <<< HOZZÁADVA: setMatchState a context értékbe
        // Opcionális: Metódusok a meccs állapotának frontendről történő módosítására
        // (ezek emitAction-t hívnának a backendnek)
        // setPlayerReady: (isReady: boolean) => { ... emitAction('player/setReady', { isReady }); ... },
        // submitAnswer: (questionId: string, answerId: string) => { ... emitAction('player/submitAnswer', { questionId, answerId }); ... },

    }), [matchState, setMatchState]); // <<< HOZZÁADVA: setMatchState a függőségekhez

    return (
        <MatchContext.Provider value={contextValue}>
            {children}
        </MatchContext.Provider>
    );
};
