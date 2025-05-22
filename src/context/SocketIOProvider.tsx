// src/context/SocketIOProvider.tsx - Korrigálva
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useRef,
    useMemo,
} from 'react';
import { Socket, io, SocketOptions } from 'socket.io-client';

// --- 1. Kontextus Értékének Típusa ---
type SocketContextType = {
    socket: Socket | null;
    isConnected: boolean;
    isAuthenticated: boolean;
    // Itt nem adjuk vissza a nyers emit/on/off-ot, hanem a custom onAction-t
    // emit: Socket['emit']; // Ha mégis kell a nyers emit, hagyd bent
    // on: Socket['on'];     // Ha mégis kell a nyers on, hagyd bent
    // off: Socket['off'];    // Ha mégis kell a nyers off, hagyd bent

    // Custom metódus az akciók küldésére a szervernek
    emitAction: (type: string, payload?: any) => void;

    // Custom metódus a szerver actionResponse válaszainak figyelésére típus alapján
    onActionResponse: (type: string, callback: (data: any) => void) => () => void;

    // Custom metódus a szerver által küldött általános action események figyelésére típus alapján (pl. broadcastok)
    onServerAction: (type: string, callback: (payload: any) => void) => () => void;
};

// --- 2. Kontextus Létrehozása ---
// Kezdeti értékek a hook használata előtti állapotra
export const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    isAuthenticated: false,

    emitAction: (() => {}) as any,
    onActionResponse: (() => (() => {})) as any, // Visszaad egy üres cleanup függvényt
    onServerAction: (() => (() => {})) as any, // Visszaad egy üres cleanup függvényt
});

console.log('>>> Provider File: SocketContext object created.', SocketContext);
// (window as any).mySocketContextFromProvider = SocketContext; // Debughoz jó lehet

// --- 3. useSocket Custom Hook ---
export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (context === undefined) { // useContext null helyett undefined-et ad vissza, ha nincs Provider
        throw new Error('useSocket must be used within a SocketIOProvider');
    }
    return context;
};

// --- 4. SocketIOProvider Props ---
interface SocketIOProviderProps {
    children: ReactNode;
    url: string;
    options?: Partial<SocketOptions>;
}

// --- 5. Provider Komponens ---
export const SocketIOProvider: React.FC<SocketIOProviderProps> = ({ children, url, options }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    // cleanupExpectedRef már nem feltétlenül szükséges, ha a cleanup mindig fut
    // const cleanupExpectedRef = useRef(false);

    // useRef a custom action response figyelők tárolására a cleanup miatt
    const actionResponseListenersRef = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());
    // useRef a custom server action figyelők tárolására a cleanup miatt
    const serverActionListenersRef = useRef<Map<string, Set<(...args: any[]) => void>>>(new Map());


    useEffect(() => {
        if (!url) {
            console.error("SocketIOProvider requires a 'url' prop.");
            return;
        }

        console.log(`Connecting to Socket.IO server at ${url}...`);

        // Létrehozzuk a socket példányt
        const socket = io(url, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5,
            ...options,
        });

        // Tároljuk a socket referenciát a hook életciklusán kívülre
        socketRef.current = socket;
        // cleanupExpectedRef.current = true; // Már nem feltétlenül kell

        // --- ALAP Socket.IO Események Figyelése ---
        // Ezek a figyelők a socket objektumra kerülnek, és a cleanupban le kell szedni őket.
        const onConnect = () => {
            console.log('Socket.IO connected! Socket ID:', socket.id);
            setIsConnected(true);
            setIsAuthenticated(false); // újra azonosítás szükséges minden új kapcsolódáskor
        };

        const onDisconnect = (reason: string) => {
            console.log(`Socket.IO disconnected: ${reason}`);
            setIsConnected(false);
            setIsAuthenticated(false); // Lecsatlakozáskor már nem vagyunk autentikálva
        };

        const onConnectError = (err: Error) => {
            console.error('Socket.IO connection error:', err);
        };

        const onReconnectAttempt = (attemptNumber: number) => {
            console.log(`Socket.IO reconnect attempt #${attemptNumber}...`);
        };

        const onReconnect = (attemptNumber: number) => {
            console.log(`Socket.IO reconnected successfully after ${attemptNumber} attempts.`);
            // A 'connect' esemény is lefut reconnect után, ott kezeljük az isConnected/isAuthenticated state-et.
            // Itt lehetne specifikus reconnect logikát kezelni, ha kell.
        };

        const onReconnectError = (err: Error) => {
            console.error('Socket.IO reconnect error:', err);
        };

        const onReconnectFailed = () => {
            console.error('Socket.IO reconnect failed!');
        };


        // --- Socket.IO Eseményfigyelők Beállítása ---
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('reconnect_attempt', onReconnectAttempt);
        socket.on('reconnect', onReconnect);
        socket.on('reconnect_error', onReconnectError);
        socket.on('reconnect_failed', onReconnectFailed);


        // --- ÁLTALÁNOS SZERVER VÁLASZ (actionResponse) Figyelő ---
        // Ezt a figyelőt a Provider kezeli, és továbbítja a custom onActionResponse metódus által regisztrált handlereknek.
        const onActionResponse = (data: any) => {
            console.log('[Provider] Received actionResponse:', data);
            // Itt frissíthetjük az általános autentikációs státuszt a host/identify válasz alapján
            if (data.type === 'Response/host/identify' || data.type === 'Response/player/identify') {
                if (data.status === 'success') {
                    setIsAuthenticated(true);
                    console.log('[Provider] Authentication status set to true.');
                } else {
                    setIsAuthenticated(false);
                    console.log('[Provider] Authentication status set to false.');
                }
            }

            // Továbbítjuk a választ a custom onActionResponse metódus által regisztrált specifikus handlereknek
            const handlers = actionResponseListenersRef.current.get(data.type);
            if (handlers) {
                handlers.forEach(handler => handler(data.data)); // Továbbítjuk a 'data' mező tartalmát a handlernek
            }
        };
        socket.on('actionResponse', onActionResponse);


        // --- ÁLTALÁNOS SZERVER BROADCAST (action) Figyelő ---
        // Ezt a figyelőt a Provider kezeli, és továbbítja a custom onServerAction metódus által regisztrált handlereknek.
        const onServerAction = (data: any) => {
            console.log('[Provider] Received server action:', data);
            if (!data || !data.type) {
                console.warn('[Provider] Received server action without type:', data);
                return;
            }
            const handlers = serverActionListenersRef.current.get(data.type);
            if (handlers) {
                handlers.forEach(handler => handler(data.payload)); // Továbbítjuk a 'payload' mező tartalmát a handlernek
            }
        };
        socket.on('action', onServerAction);


        // --- Cleanup ---
        return () => {
            console.log('--- Socket Provider cleanup running ---');
            // cleanupExpectedRef már nem feltétlenül kell
            // console.log('>>> Cleanup expectedRef.current:', cleanupExpectedRef.current);

            // Mindig szedjük le a figyelőket, mielőtt az effekt újra lefutna vagy unmountolna
            console.log('Cleaning up Socket.IO listeners...');

            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('reconnect_attempt', onReconnectAttempt);
            socket.off('reconnect', onReconnect);
            socket.off('reconnect_error', onReconnectError);
            socket.off('reconnect_failed', onReconnectFailed);

            // Szedjük le az általános válasz figyelőket is
            socket.off('actionResponse', onActionResponse);
            socket.off('action', onServerAction);


            // Opcionális: Szedjük le az ÖSSZES specifikus handlert is a ref-ekből, ha a socket null lesz
            // Bár a custom onActionResponse/onServerAction cleanup függvényei is ezt teszik,
            // ez egy extra biztonsági lépés lehet, ha a provider unmountol.
            actionResponseListenersRef.current.clear();
            serverActionListenersRef.current.clear();


            // Csak akkor disconnectáljunk, ha a cleanup nem egy gyors reconnect/re-render miatt fut le.
            // Ezt nehéz megbízhatóan detektálni. A Socket.IO reconnection: true beállítása segít.
            // Ha a Socket.IO maga kezeli a reconnectet, nem feltétlenül kell itt disconnectálni,
            // hacsak nem akarjuk teljesen megszüntetni a kapcsolatot (pl. user kijelentkezett).
            // Ha a Provider unmountolásakor mindig disconnectálni akarunk:
            console.log('Disconnecting Socket.IO client...');
            socket.disconnect(); // Megszakítjuk a kapcsolatot
            socketRef.current = null; // Nullázzuk a referenciát

            // cleanupExpectedRef.current = false; // Már nem feltétlenül kell
            console.log('--- Socket Provider cleanup finished ---');
        };

        // Függőségek: Az effekt csak az URL változásakor fusson újra.
        // A socketRef.current-et NE tedd ide, mert az effekt újra futna a socket beállításakor.
    }, [url, options]); // Ha az options is változhat, tedd ide


    // --- Kontextus Érték (memoizálva a felesleges render elkerülésére) ---
    const contextValue = useMemo(() => {
        // Custom emit metódus az akciók küldésére
        const emitAction: SocketContextType['emitAction'] = (type, payload) => {
            if (socketRef.current && isConnected) { // Csak ha van socket és csatlakozva vagyunk
                console.log(`[Provider] Emitting action: ${type}`, payload);
                socketRef.current.emit('action', { type, payload });
            } else {
                console.warn(`[Provider] Nem lehet action-t küldeni (${type}): Nincs kapcsolat.`);
            }
        };

        // Custom metódus a szerver actionResponse válaszainak figyelésére típus alapján
        const onActionResponse: SocketContextType['onActionResponse'] = (type, callback) => {
            if (!socketRef.current) {
                console.warn(`[Provider] Nem lehet actionResponse figyelőt beállítani (${type}): Nincs socket.`);
                return () => {}; // Üres cleanup
            }
            // Tároljuk a handlert a ref-ben típus szerint
            if (!actionResponseListenersRef.current.has(type)) {
                actionResponseListenersRef.current.set(type, new Set());
            }
            actionResponseListenersRef.current.get(type)!.add(callback);

            // Visszaadunk egy cleanup függvényt a leiratkozáshoz
            return () => {
                console.log(`[Provider] Removing actionResponse listener for type: ${type}`);
                const handlers = actionResponseListenersRef.current.get(type);
                if (handlers) {
                    handlers.delete(callback);
                    if (handlers.size === 0) {
                        actionResponseListenersRef.current.delete(type);
                    }
                }
            };
        };

        // Custom metódus a szerver által küldött általános action események figyelésére típus alapján
        const onServerAction: SocketContextType['onServerAction'] = (type, callback) => {
            if (!socketRef.current) {
                console.warn(`[Provider] Nem lehet serverAction figyelőt beállítani (${type}): Nincs socket.`);
                return () => {}; // Üres cleanup
            }
            // Tároljuk a handlert a ref-ben típus szerint
            if (!serverActionListenersRef.current.has(type)) {
                serverActionListenersRef.current.set(type, new Set());
            }
            serverActionListenersRef.current.get(type)!.add(callback);

            // Visszaadunk egy cleanup függvényt a leiratkozáshoz
            return () => {
                console.log(`[Provider] Removing serverAction listener for type: ${type}`);
                const handlers = serverActionListenersRef.current.get(type);
                if (handlers) {
                    handlers.delete(callback);
                    if (handlers.size === 0) {
                        serverActionListenersRef.current.delete(type);
                    }
                }
            };
        };


        return {
            socket: socketRef.current,
            isConnected,
            isAuthenticated,
            emitAction, // Custom emitAction
            onActionResponse, // Custom onActionResponse
            onServerAction, // Custom onServerAction
            // Ha a nyers emit/on/off mégis kell más hookoknak, add vissza itt:
            // emit: socketRef.current ? socketRef.current.emit.bind(socketRef.current) : (() => {}) as any,
            // on: socketRef.current ? socketRef.current.on.bind(socketRef.current) : (() => {}) as any,
            // off: socketRef.current ? socketRef.current.off.bind(socketRef.current) : (() => {}) as any,
        };
    }, [isConnected, isAuthenticated]); // Függőségek: csak ha a kapcsolat vagy az azonosítás állapota változik

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

// --- Típus exportálása ---
export type { SocketContextType };
