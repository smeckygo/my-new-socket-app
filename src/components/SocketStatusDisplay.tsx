// src/components/SocketStatusDisplay.tsx

import React, { useContext, useEffect, useRef } from 'react';
import {SocketContext, useSocket} from '../context/SocketIOProvider'; // Győződj meg a helyes útvonalról!

function SocketStatusDisplay() {
    const socketContext = useContext(SocketContext);
    const {isConnected} = useSocket();

    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    console.log(`>>> SocketStatusDisplay Rendering. Render count: ${renderCountRef.current}, isConnected: ${socketContext.isConnected}, isAuthenticated: ${socketContext.isAuthenticated}`);
    console.log(`>>> SocketStatusDisplay Consuming Context. Context isConnected: ${socketContext.isConnected}, isAuthenticated: ${socketContext.isAuthenticated}`);

    useEffect(() => {
        console.log(`--- SocketStatusDisplay useEffect running. Context isConnected dependency value: ${socketContext.isConnected}, isAuthenticated: ${socketContext.isAuthenticated}`);

        // Itt tudnád elindítani az azonosítási folyamatot, ha az isConnected true ÉS még nincs autentikálva
        // Ezt egy külön hookkal is lehet intézni, lásd a következő lépést.


        return () => {
            console.log(`--- SocketStatusDisplay useEffect cleanup running. Context isConnected dependency value before cleanup: ${socketContext.isConnected}, isAuthenticated: ${socketContext.isAuthenticated}`);
        };
    }, [socketContext, isConnected]); // Függőség a teljes kontextus objektumra


    return (
        <div>
            <p>Kapcsolat Státusz: {socketContext.isConnected ? 'Connected' : 'Disconnected'}</p>
            <p>Azonosítás Státusz: {socketContext.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        </div>
    );
}

export default SocketStatusDisplay;