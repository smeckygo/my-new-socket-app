// src/hooks/socketHandlers/useQuizSetupHandler.ts - Játék Létrehozása és Indítása (HOST/FRONTEND)

import React, {useCallback, useEffect, useRef, useState} from 'react';
import { useSocket } from '../../context/SocketIOProvider'; // Importáljuk a useSocket hookot
import { useApp } from '../../context/AppProvider'; // Importáljuk a useApp hookot a navigációhoz
import { useMatch } from '../../context/MatchProvider'; // Importáljuk a useMatch hookot
// Importáljuk a szükséges típusokat a types.ts-ből
import { QuizSetupData, BackendActionResponse, PlayerAppState, GameCreatedResponseData } from "../../types";
// <<< HOZZÁADVA: MatchState importálása a MatchProviderből >>>
import { MatchState } from '../../context/MatchProvider'; // Importáljuk a MatchState típust


/**
 * Custom hook a Socket.IO Quiz indításának a folyamat kezelésére.
 * Felelős a játék létrehozásáért és indításáért a backenddel kommunikálva.
 * @param onGameStartCallback - Callback függvény, amit a játék sikeres indítása után hívunk meg a navigációhoz.
 */
export const useQuizSetup = (onGameStartCallback: () => void) => { // A hook most már kap egy callbacket a navigációhoz
    // State a nehézséghez (1-10)
    const [difficulty, setDifficulty] = useState<number>(3);
    // State a hosszhoz (kérdések száma, pl. 5-50)
    const [length, setLength] = useState<number>(25); // Példa érték
    // Loading state a UI visszajelzéshez
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Hiba state a UI visszajelzéshez
    const [error, setError] = useState<string | null>(null);

    // Lekérjük a useSocket hookból a szükséges metódusokat és állapotokat
    const { socket, isConnected, isAuthenticated, emitAction, onActionResponse } = useSocket();
    // Lekérjük a handlePageChange metódust a useApp hookból (ha közvetlenül navigálnánk innen)
    // const { handlePageChange } = useApp(); // Ezt a hook nem használja közvetlenül, a onGameStartCallback-et hívja
    // Lekérjük a setMatchState metódust a useMatch hookból
    const { matchState, setMatchState } = useMatch(); // Lekérjük a setMatchState-et

    const [appState, setAppState] = useState<PlayerAppState>('enterName');

    // Handler a nehézség csúszka változásához. useCallback-kel stabilizáljuk.
    const handleDifficultyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setDifficulty(Number(event.target.value));
    }, []);

    // Handler a hossz csúszka változásához. useCallback-kel stabilizáljuk.
    const handleLengthChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setLength(Number(event.target.value));
    }, []);


    // --- useEffect hook a backend válaszok figyelésére ---
    useEffect(() => {
        if (!socket) return;

        // --- FIGYELŐ: Válasz a Játék Létrehozására ---
        const cleanupCreateGameListener = onActionResponse('Response/game/created', (data: GameCreatedResponseData & { message?: string }) => { // <<< message hozzáadva a típushoz
            console.log('[useQuizSetup] Received Response/game/created:', data);
            if (data && data.game_id) {
                console.log(`[useQuizSetup] Game created successfully with ID: ${data.game_id}. Code: ${data.room_code}. Attempting to start game...`);

                // <<< ÚJ LOGIKA: Frissítjük a MatchProvider állapotát a létrehozott játék adataival >>>
                setMatchState((prev: MatchState) => ({ // <<< prev típusának megadása
                    ...prev,
                    gameId: data.game_id,
                    hostId: data.host_id,
                    status: data.status, // 'waiting'
                    players: [], // Kezdetben üres játékoslista
                    currentQuestion: null,
                    currentQuestionIndex: data.current_question_index,
                    // Hozzáadjuk a room_code-ot és a beállításokat is, ha a MatchState tartalmazza
                    // Feltételezve, hogy a MatchState interfész bővítve lett ezekkel a mezőkkel
                    // room_code: data.room_code,
                    // difficulty: data.difficulty,
                    // length: data.length,
                    isLoadingMatch: false, // Befejeződött a betöltés
                    error: null,
                }));
                console.log('[useQuizSetup] MatchProvider state updated with new game data.'); // <<< Hozzáadott log
                // <<< ---------------------------------------------------------------------- >>>

                // Ha a játék sikeresen létrejött, elküldjük az indítás akciót
                emitAction('game/start', { gameId: data.game_id }); // Elküldjük a játék indítás akciót
                setAppState('lobby');
            } else {
                setError(data?.message || 'Nem sikerült létrehozni a játékot.'); // <<< message property használata
                setIsLoading(false);
            }
        });

        // --- FIGYELŐ: Válasz a Játék Indítására ---
        const cleanupStartGameListener = onActionResponse('Response/game/started', (data: { gameId: string; message?: string }) => {
            console.log('[useQuizSetup] Received Response/game/started:', data); // <<< Hozzáadott log
            if (data && data.gameId) {
                console.log(`[useQuizSetup] Game ${data.gameId} started successfully. Calling onGameStartCallback...`); // <<< Hozzáadott log
                setIsLoading(false);
                setError(null);
                // Navigálunk a lobby oldalra a callback függvényen keresztül
                onGameStartCallback(); // Hívjuk a Layout-tól kapott callbacket

            } else {
                setError(data?.message || 'Nem sikerült elindítani a játékot.');
                setIsLoading(false);
            }
        });

        // --- Cleanup ---
        return () => {
            console.log('[useQuizSetup] Cleanup running...');
            cleanupCreateGameListener();
            cleanupStartGameListener();
        };

    }, [socket, emitAction, onActionResponse, onGameStartCallback, setMatchState]); // Függőségek


    // --- A Kvíz Indítás Akciót Küldő Függvény ---
    const startQuizAction = () => {
        // Ellenőrzések a küldés előtt: Van-e kapcsolat? Host-e a felhasználó?
        if (!socket || !isConnected) {
            setError('Nincs kapcsolat a szerverrel.');
            return;
        }
        // Opcionális: Ellenőrizheted az isAuthenticated és isHost state-eket is, ha a PlayerContextből lekérded az isHost flaget.
        // const { player } = usePlayer(); // Lekérheted itt, ha szükséges
        // if (!player?.isHost) { setError('Csak a host indíthat játékot.'); return; }

        setIsLoading(true); // Betöltés állapot beállítása
        setError(null); // Töröljük az esetleges korábbi hibát

        console.log('[useQuizSetup] Attempting to create game...');
        // 1. Elküldjük a "create game" akciót a backendnek.
        // A backendnek szüksége lehet a nehézségre és a hosszra a játék létrehozásához.
        emitAction('game/create', { difficulty, length }); // Küldjük a játék létrehozás akciót
    };


    // Visszatérjük a state értékeket és a csúszka kezelő függvényeket, valamint az akció indító függvényt.
    return {
        difficulty,
        length,
        handleDifficultyChange,
        handleLengthChange,
        startQuizAction, // A függvény, amit a komponens hív a gomb kattintásra
        isLoading, // Betöltés állapot a UI-nak
        error, // Hibaüzenet a UI-nak
    };
};
