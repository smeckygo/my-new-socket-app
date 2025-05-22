// src/context/AppProvider.tsx - Frontend (Kezdeti Oldal Betöltéssel)

import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useMemo,
} from 'react';

// Importáljuk a PlayerAppState típust a types.ts-ből
import { PlayerAppState, AppState, AppContextType } from '../types'; // Győződj meg a helyes elérési útról!


// --- 1. Kontextus Létrehozása ---
// Kezdeti értékek a hook használata előtti állapotra
export const AppContext = createContext<AppContextType | undefined>(undefined);


// --- 2. useApp Custom Hook ---
export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) { // useContext null helyett undefined-et ad vissza, ha nincs Provider
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};


// --- 3. Provider Komponens Props ---
interface AppProviderProps {
    children: ReactNode;
}

// --- 4. Provider Komponens ---
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    // Az alkalmazás globális állapotát egy useState hook kezeli
    // FIX: Kezdeti állapot beolvasása a localStorage-ból
    const [appState, setAppState] = useState<AppState>(() => {
        // FIX: A localStorage-ból a 'page' kulcsot olvassuk be, nem a 'currentPage'-et
        const storedPage = localStorage.getItem('page'); // Használjuk a 'page' kulcsot
        // Ellenőrizzük, hogy a tárolt oldal érvényes PlayerAppState típusú-e
        const initialPage: PlayerAppState = (storedPage && (['enterName', 'dashboard', 'joinGame', 'lobby', 'game', 'friends', 'question', 'notificationsPage', 'results', 'settings', 'ranking', 'contact', 'stats', 'topicSelection'] as PlayerAppState[]).includes(storedPage as PlayerAppState))
            ? (storedPage as PlayerAppState)
            : 'enterName'; // Alapértelmezett oldal, ha nincs tárolva vagy érvénytelen

        return { currentPage: initialPage };
    });

    // Callback függvény az oldal váltásához (memoizálva a stabilitás érdekében)
    // FIX: Oldal mentése a localStorage-ba is
    const handlePageChange = useCallback((page: PlayerAppState) => {
        console.log(`[AppProvider] Navigating from ${appState.currentPage} to ${page}.`);
        setAppState(prev => ({ ...prev, currentPage: page }));
        // FIX: A localStorage-ba is a 'page' kulcs alá mentjük
        localStorage.setItem('page', page); // Mentjük az új oldalt a localStorage-ba
    }, [appState.currentPage]); // Függőség: ha az aktuális oldal változik

    // A context érték, amit a Provider biztosít
    const contextValue = useMemo(() => ({
        appState,
        handlePageChange,
        // ... egyéb metódusok és állapotok ...
    }), [appState, handlePageChange]); // Függőségek: ha az appState vagy a handlePageChange változik

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};