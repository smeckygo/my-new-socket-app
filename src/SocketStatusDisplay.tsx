import React, { useEffect, useRef, useState } from 'react';
// Importáljuk a useSocket hookot
import { useSocket } from './context/SocketIOProvider';
// Socket típust nem kell importálni, ha a CustomSocket-et a szerver oldalon használjuk.
// import { Socket } from 'socket.io-client';

function SocketStatusDisplay() {
    // <<< Használd a useSocket hookot a Context értékek lekéréséhez >>>
    // FIX: emit, on, off helyett isConnected és socket lekérése
    const { isConnected, socket } = useSocket();
    // <<< -------------------------------------------------------- >>>

    // isAuthenticated state valószínűleg nem kell itt, ha a Provider kezeli
    // const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Render számoló ref debughoz
    const renderCountRef = useRef(0);
    renderCountRef.current++;

    // Ref a socket ID tárolására a cleanup loghoz
    const attachedSocketIdRef = useRef<string | undefined>(undefined);
    // Ref a handler függvény referencia tárolására (ha lenne itt figyelő)
    // const handlerRef = useRef<((...args: any[]) => void) | null>(null);


    // useEffect hook a Socket ID logolásához és esetleges figyelők beállításához
    useEffect(() => {
        console.log(`--- SocketStatusDisplay useEffect running. Socket ID: ${socket?.id}, isConnected: ${isConnected}`);

        // Ha van socket, tároljuk az ID-ját a cleanup loghoz
        if (socket) {
            attachedSocketIdRef.current = socket.id;
        } else {
            attachedSocketIdRef.current = undefined;
        }


        // --- Eseményfigyelők Beállítása (ha lennének itt specifikusak) ---
        // Példa: ha a SocketStatusDisplay-nek kellene figyelnie egy specifikus eseményt
        // const handleSomeEvent = (data: any) => {
        //     console.log('SocketStatusDisplay: Received some event:', data);
        // };
        // if (socket) {
        //     // Használd a Provider custom onServerAction metódusát, ha broadcast
        //     // const cleanupSomeEvent = onServerAction('someEvent', handleSomeEvent);
        //     // Vagy a nyers on metódust, ha a Provider exportálja
        //     // socket.on('someEvent', handleSomeEvent);
        //     // handlerRef.current = handleSomeEvent; // Tárold a referenciát cleanuphoz
        // }


        console.log(`>>> SocketStatusDisplay useEffect: Setting up listeners for socket ID: ${socket?.id}`);


        // --- Cleanup ---
        return () => {
            console.log('--- SocketStatusDisplay useEffect cleanup running.');
            console.log(`    Cleanup Socket ID: ${socket?.id}`);
            console.log(`    Cleanup attachedSocketIdRef.current: ${attachedSocketIdRef.current}`);
            // console.log(`    Cleanup handler ref exists: ${!!handlerRef.current}`);


            // <<< Szedd le az eseményfigyelőket a cleanupban >>>
            // Ha voltak itt figyelők, szedd le őket.
            // Példa:
            // if (socket && handlerRef.current) {
            //      console.log('--- SocketStatusDisplay cleanup: Removing listener for socket ID:', socket.id);
            //      // Ha a nyers off metódust használtad:
            //      // socket.off('someEvent', handlerRef.current);
            //      // Ha a custom onServerAction által visszaadott cleanup-ot használtad:
            //      // cleanupSomeEvent(); // Hívd a cleanup függvényt
            // } else {
            //     console.log('--- SocketStatusDisplay cleanup: Skipping listener removal.');
            // }


            console.log('--- SocketStatusDisplay useEffect cleanup finished ---');
        };

        // Függőségek: az effekt akkor fut újra, ha a socket vagy a kapcsolat állapota változik.
    }, [socket, isConnected /* , onServerAction */ ]); // Ha onServerAction-t használsz, add hozzá


    return (
        <div>
            {/* Render számoló kijelzése debughoz */}
            {/* <p>Render Count: {renderCountRef.current}</p> */}

            {/* Kapcsolat állapot kijelzése */}
            <p>
                Socket Status: {isConnected ? 'Connected' : 'Disconnected'}
                {socket && isConnected && ` (ID: ${socket.id})`}
            </p>

            {/* Autentikáció állapot kijelzése (ha a Provider kezeli) */}
            {/* <p>Authentication Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p> */}

            {/* Ide jöhetnek további UI elemek a socket státuszhoz */}
        </div>
    );
}

export default SocketStatusDisplay;