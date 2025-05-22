// src/index.tsx (Root komponens rendereli a Providert és a gyerek fogyasztót)

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Megmarad, ha CRA hozta létre
// Importáld a SocketIOProvider-t
import { SocketIOProvider } from './context/SocketIOProvider';
// Importáld az új gyerek komponenst
import SocketStatusDisplay from './SocketStatusDisplay';
import App from "./App";

const SOCKET_SERVER_URL: string = "http://localhost:3100"; // <<< FRISSÍTSD EZT A TE BACKEND CÍMEDRE!


// Root komponens - csak a Providert és a gyerek fogyasztót rendereli
function Root() {

    // Távolíts el minden más kódot, ami a korábbi minimalist tesztekből maradt itt,
    // ami nem kapcsolódik a Provider rendereléséhez vagy a gyerek komponens importjához.
    // NE hívd a useContext-et a Root komponensen belül itt!
    // NE legyenek useEffect logok a Root komponensben itt!
    console.log('>>> Root Component Rendering.'); // Logolás a Root komponens rendereléskor

    return (
        // Rendereljük StrictMode-dal
            <SocketIOProvider url={SOCKET_SERVER_URL}>
                {/* Itt rendereljük a gyerek komponenst, ami fogyasztja a kontextust */}
                <SocketStatusDisplay />
                <App />
            </SocketIOProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Root />);

// Tisztítsd ki az src/index.tsx alapértelmezett tartalmát:
// - Távolíts el minden importot és kódot, ami nem kell ehhez a teszthez
// - Törölheted az src/App.tsx és src/reportWebVitals.ts fájlokat, ha nem használod őket