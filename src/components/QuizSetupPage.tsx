// src/components/QuizSetupPage.tsx - Játék Létrehozása (HOST/FRONTEND)

import React, { useState } from 'react';
import TopBar from './TopBar'; // Feltételezve, hogy van TopBar komponens
import { useSocket } from "../context/SocketIOProvider"; // Importáljuk a useSocket hookot
import { useQuizSetup } from '../hooks/socketHandlers/useQuizSetupHandler'; // Importáljuk a useQuizSetup hookot
import { useApp } from '../context/AppProvider'; // Importáljuk a useApp hookot a navigációhoz


// Definiáljuk a QuizSetupPage komponens propjainak típusát
interface QuizSetupPageProps {
    // onGameStart prop a Layouttól érkezik, hogy jelezze az oldalváltás szükségességét
    onGameStart: () => void; // A Layout adja át ezt a callbacket
}

// A QuizSetupPage komponens definíciója
const QuizSetupPage: React.FC<QuizSetupPageProps> = ({ onGameStart }) => { // Fogadjuk az onGameStart propot
    // Lekérjük a useSocket hookból a kapcsolat állapotát a gomb disabled állapotához
    const { isConnected, isAuthenticated } = useSocket();
    // Lekérjük a handlePageChange metódust a useApp hookból (ha közvetlenül navigálnánk innen)
    // const { handlePageChange } = useApp(); // Ezt a hook nem használja közvetlenül


    // <<< HASZNÁLJUK A useQuizSetup HOOKOT >>>
    // Átadjuk neki az onGameStart callbacket a navigációhoz.
    const {
        difficulty,
        length,
        handleDifficultyChange,
        handleLengthChange,
        startQuizAction, // A függvény, ami elindítja a játék létrehozását/indítását
        isLoading, // Betöltés állapot a UI-nak
        error, // Hibaüzenet a UI-nak
    } = useQuizSetup(onGameStart); // Átadjuk az onGameStart callbacket a hooknak
    // <<< ------------------------------ >>>


    // Handler a "Kvíz indítása" gomb kattintásához
    const onStartQuizButtonClick = () => {
        console.log(`[QuizSetupPage] Start quiz button clicked. Difficulty: ${difficulty}, Length: ${length}`);
        startQuizAction(); // Hívjuk a hook által adott függvényt
    };

    // Meghatározzuk a gomb disabled állapotát
    const isStartButtonDisabled = isLoading || !isConnected || !isAuthenticated;


    return (
        // <<< KORRIGÁLVA: Pontosan a megadott kinézetet adjuk vissza >>>
        <>
            <main className="main-content-area">
                <TopBar />
                <section className="central-content">
                    <h1>MindQuest</h1> {/* Hozzáadva a hiányzó cím */}
                    <h2>Kvíz beállítások</h2> {/* Hozzáadva a hiányzó alcím */}

                    {error && <p className="error-message">{error}</p>} {/* Hibaüzenet megjelenítése */}

                    <div className="quiz-settings">
                        {/* Nehézség beállítás csoport */}
                        <div className="setting-group">
                            <label htmlFor="difficulty-slider">Nehézség:</label>
                            <input
                                type="range"
                                id="difficulty-slider"
                                name="difficulty"
                                min="1"
                                max="10"
                                value={difficulty}
                                step="1"
                                onChange={handleDifficultyChange}
                                disabled={isLoading}
                            />
                            <span>{difficulty}</span>
                        </div>

                        {/* Hossz beállítás csoport (kérdések száma) */}
                        <div className="setting-group">
                            <label htmlFor="length-slider">Hossz (kérdések száma):</label>
                            <input
                                type="range"
                                id="length-slider"
                                name="length"
                                min="5"
                                max="50"
                                value={length}
                                step="5"
                                onChange={handleLengthChange}
                                disabled={isLoading}
                            />
                            <span>{length}</span>
                        </div>
                    </div>

                    {/* "Kvíz indítása" gomb */}
                    <button
                        className="start-quiz-button"
                        onClick={onStartQuizButtonClick}
                        disabled={isStartButtonDisabled}
                    >
                        {isLoading ? 'Játék létrehozása...' : 'Kvíz indítása'} {/* Gomb szöveg betöltéskor */}
                    </button>

                    <p className="description-text">Válassz kategóriát és kezdd el a kihívást!</p>
                </section>
                {/* ... (Footer) ... */}
            </main>
        </>
        // <<< ---------------------------------------------------- >>>
    );
}

export default QuizSetupPage;
