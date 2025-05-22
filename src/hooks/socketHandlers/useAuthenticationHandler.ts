// src/hooks/socketHandlers/useAuthenticationHandler.ts - Korrigálva (PlayerProvider setPlayer hívás)

import React, { useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketIOProvider';
import { usePlayer } from '../../context/PlayerProvider'; // <<< usePlayer hook a PlayerProviderből
// Importáljuk a szükséges payload típusokat a types.ts fájlból
import { IdentifyPlayerPayload, IdentifyHostPayload, Player } from '../../types'; // <<< Importáljuk a Player típust is
// Socket típust nem kell importálni, ha a CustomSocket-et a szerver oldalon használjuk és nem a kliens oldalon.
// import { Socket } from 'socket.io-client';

// Definiálunk egy unió típust a lehetséges azonosító payloadokhoz
type IdentifyPayload = IdentifyPlayerPayload | IdentifyHostPayload;


/**
 * Custom hook a Socket.IO autentikációs folyamat kezelésére.
 * Az 'action' eseményt küldi el 'player/identify' vagy 'host/identify' típussal.
 * Figyeli a backend 'actionResponse' válaszát.
 *
 * @param authData Az autentikációhoz szükséges payload (IdentifyPayload típusú objektum), vagy null ha nincs.
 * Tartalmazhat user_id/username VAGY hostKey mezőket.
 */
export const useAuthenticationHandler = (authData: IdentifyPayload | null) => {
    // Lekérjük a szükséges dolgokat a useSocket hookból
    const { socket, isConnected, isAuthenticated, emitAction, onActionResponse } = useSocket();
    // <<< Lekérjük a player objektumot és a setPlayer metódust a PlayerProviderből >>>
    const { player, setPlayer } = usePlayer(); // Lekérjük a setPlayer metódust
    // <<< ---------------------------------------------------- >>>

    // Tárolja, hogy melyik Socket ID-hez már küldtünk autentikációt
    const lastAuthSocketIdRef = useRef<string | null>(null);

    useEffect(() => {
        console.log('useAuthenticationHandler useEffect running...');
        console.log('socket:', !!socket, 'isConnected:', isConnected, 'authData:', !!authData, 'isAuthenticated:', isAuthenticated);
        console.log('lastAuthSocketIdRef.current:', lastAuthSocketIdRef.current);
        console.log('Current socket ID:', socket?.id);


        // <<< Reseteljük a 'már emitált' állapotot a ref-ben, ha új kapcsolat jött létre >>>
        // Ha van aktív socket, ÉS az ID-je NEM egyezik az utoljára sikeresen emitált ID-vel,
        // az azt jelenti, hogy új kapcsolat jött létre (vagy a socket újra inicializálódott).
        // Ebben az esetben a "már emitált" állapotot reseteljük ehhez az új ID-re.
        // A ref-et magát AZ EMIT HÍVÁSA UTÁN frissítjük.
        if (socket && socket.id !== lastAuthSocketIdRef.current) {
            console.log(`useAuthenticationHandler: Socket ID changed from ${lastAuthSocketIdRef.current} to ${socket.id}. Resetting emit status.`);
            // A lastAuthSocketIdRef.current frissítése lejjebb történik, az emit blokkban.
        }


        // --- <<< ÁLLÍTSUK BE A BACKEND VÁLASZ HANDLERT AZ ACTIONRESPONSE ESEMÉNYRE >>> ---
        // Használjuk a custom onActionResponse metódust, ami típus alapján szűr.
        // A backend 'Response/player/identify' vagy 'Response/host/identify' típussal válaszol.
        // A handler csak a payload.data mező tartalmát kapja meg a custom onActionResponse miatt.

        let cleanupPlayerAuthResponseListener: () => void;
        let cleanupHostAuthResponseListener: () => void;

        // Csak akkor állítjuk be a figyelőket, ha van socket
        if (socket) {
            cleanupPlayerAuthResponseListener = onActionResponse('Response/player/identify', (data: any) => { // data: IdentifyResponseData
                console.log('[useAuthenticationHandler] Received Player Identify response data:', data);
                // <<< ÚJ LOGIKA: Frissítjük a PlayerProviderben lévő player objektumot >>>
                if (data && data.userId && data.name) {
                    // FIX: Közvetlenül egy Player objektumot adunk át a setPlayer-nek.
                    // Az előző player állapotot a 'player' változóból olvassuk ki, ami a hook scope-jában elérhető.
                    const updatedPlayer: Player = {
                        user_id: data.userId,
                        username: data.name,
                        score: player?.score || 0, // Megtartjuk a korábbi score-t, vagy alap 0
                        status: player?.status || 'online', // Megtartjuk a korábbi státuszt, vagy alap 'online'
                        isHost: data.isHost ?? false, // isHost beállítása a szerver válasza alapján
                    };
                    setPlayer(updatedPlayer); // Közvetlenül átadjuk a Player objektumot
                    console.log('[useAuthenticationHandler] PlayerProvider updated with Player Identify response.');
                }
                // A useSocket hook már frissíti az isAuthenticated state-et a status alapján.
            });

            cleanupHostAuthResponseListener = onActionResponse('Response/host/identify', (data: any) => { // data: IdentifyResponseData
                console.log('[useAuthenticationHandler] Received Host Identify response data:', data);
                // <<< ÚJ LOGIKA: Frissítjük a PlayerProviderben lévő player objektumot >>>
                if (data && data.userId && data.name) {
                    // FIX: Közvetlenül egy Player objektumot adunk át a setPlayer-nek.
                    // Az előző player állapotot a 'player' változóból olvassuk ki, ami a hook scope-jában elérhető.
                    const updatedPlayer: Player = {
                        user_id: data.userId,
                        username: data.name,
                        score: player?.score || 0, // Megtartjuk a korábbi score-t, vagy alap 0
                        status: player?.status || 'online', // Megtartjuk a korábbi státuszt, vagy alap 'online'
                        isHost: data.isHost ?? true, // isHost beállítása a szerver válasza alapján (hostnál alapból true)
                    };
                    setPlayer(updatedPlayer); // Közvetlenül átadjuk a Player objektumot
                    console.log('[useAuthenticationHandler] PlayerProvider updated with Host Identify response.');
                }
                // A useSocket hook már frissíti az isAuthenticated state-et a status alapján.
            });
        } else {
            // Ha nincs socket, üres cleanup függvényeket adunk meg
            cleanupPlayerAuthResponseListener = () => {};
            cleanupHostAuthResponseListener = () => {};
        }
        // --- <<< HANDLER BEÁLLÍTÁS VÉGE >>> ---


        // --- <<< AUTHENTIKÁCIÓ EMITÁLÁSI LOGIKA >>> ---
        // Az 'action' esemény elküldése *csak egyszer* minden érvényes kapcsolat kezdeményezéskor.
        // Emitálunk, ha:
        // 1. A kapcsolat létrejött (isConnected true).
        // 2. Van megadva autentikációs adat (authData nem null).
        // 3. Még nincs sikeresen autentikálva (isAuthenticated false).
        // 4. ÉS A LEGFONTOSABB: Még NEM küldtük el az 'authenticate' eseményt EZHEZ a konkrét Socket ID-hez.
        //    (socket?.id checking is implicit in the emitAction metódusban)

        if (
            isConnected && // Csak ha csatlakozva vagyunk
            authData && // Csak ha van auth adat (pl. hostKey vagy player név/ID)
            !isAuthenticated && // Csak ha még nincs autentikálva
            socket?.id && // Csak ha van Socket ID
            socket.id !== lastAuthSocketIdRef.current // <<< ELLENŐRIZZÜK, HOGY NEM KÜLDTÜK-E MÁR EZHEZ AZ ID-HEZ
        ) {
            console.log('useAuthenticationHandler: Socket connected and auth data available, attempting authentication...');
            console.log(`useAuthenticationHandler: Emitting action for socket ID: ${socket.id}`);

            // <<< ITT KÜLDJÜK EL AZ 'action' ESEMÉNYT A BACKENDNEK >>>
            // Használjuk a custom emitAction metódust a Kontextusból.
            // Az authData payload tartalmazza a hostKey-t VAGY player azonosító adatokat.
            // A backend handler dönti el, hogy host vagy player azonosítás.
            // Mivel a szerver oldali handler a 'player/identify' akciót kezeli mindkettőre (hostKey-vel is),
            // itt mindig 'player/identify' type-ot küldünk, a payload pedig az authData lesz.
            emitAction('player/identify', authData); // <<< Type is 'player/identify', payload is authData

            // >>> JELÖLJÜK, HOGY AZ EMIT MEGTÖRTÉNT EZHEZ AZ ID-HEZ >>>
            // Csak azután állítjuk be a ref-et, miután elküldtük az eseményt.
            lastAuthSocketIdRef.current = socket.id; // <<< Tároljuk az ID-t, amihez emitáltunk.
            console.log(`useAuthenticationHandler: Marked authentication emit as done for socket ID: ${socket.id}.`);
        }
        // --- <<< EMITÁLÁSI LOGIKA VÉGE >>> ---


        // --- CLEANUP FUNKCIÓ ---
        // Ez a funkció fut le, amikor a függőségek változnak, vagy a komponens unmountol.
        // Felelős a mellékhatások (figyelők) megszüntetéséért az előző effekt futásból.
        return () => {
            console.log('useAuthenticationHandler cleanup running...');
            console.log(`Cleanup Socket ID: ${socket?.id}`);
            console.log(`Cleanup lastAuthSocketIdRef.current: ${lastAuthSocketIdRef.current}`);

            // <<< REMOVE EVENT LISTENERS IN CLEANUP >>>
            // Használjuk a custom onActionResponse által visszaadott cleanup függvényeket.
            console.log(`Removing actionResponse listeners for socket ID: ${socket?.id}`);
            cleanupPlayerAuthResponseListener(); // Hívjuk a cleanup függvényt a Player Identify válaszhoz
            cleanupHostAuthResponseListener(); // Hívjuk a cleanup függvényt a Host Identify válaszhoz


            // A lastAuthSocketIdRef NEM kell itt null-ra állítani.
            // Ez a ref jelzi, hogy már emitáltunk EZHEZ az ID-hez, és ez az infó kell a következő rendereléshez is.

            console.log('useAuthenticationHandler cleanup finished ---');
        };

        // Függőségek: az effekt akkor fut, amikor bármelyik függőség változik.
        // Ezek az értékek a useSocket() által visszaadott objektumokból és a hook paraméteréből jönnek.
        // Include emitAction és onActionResponse metódusokat is, mert az effekt használja őket.
    }, [socket, isConnected, isAuthenticated, authData, emitAction, onActionResponse, player, setPlayer]); // <<< player és setPlayer hozzáadva a függőségekhez


    // Ez a hook nem ad vissza state-et, csak mellékhatásokat végez (emitálás, figyelő beállítás).
    // Az állapotok (isConnected, isAuthenticated) a useSocket() hookkal fogyaszthatók más komponensekben.
};