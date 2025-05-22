// src/components/CentralContent.tsx
import React, { useState } from 'react';

// Definiáljuk a CentralContent komponens propjainak típusát
interface CentralContentProps {
    onStartQuiz: () => void; // Fogadja a szülőtől kapott függvényt
}

// Használjuk a definíciót, és fogadjuk a propot
const CentralContent: React.FC<CentralContentProps> = ({ onStartQuiz }) => {
    const [difficulty, setDifficulty] = useState<number>(3);
    const [length, setLength] = useState<number>(20);

    const handleDifficultyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDifficulty(Number(event.target.value));
    };

    const handleLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLength(Number(event.target.value));
    };

    // A Kvíz indítása gomb eseménykezelője most meghívja a propként kapott függvényt
    const handleStartQuiz = () => {
        console.log(`Kvíz indítása. Nehézség: ${difficulty}, Hossz: ${length}`);
        // Meghívjuk a szülőtől (QuizSetupPage) kapott onStartQuiz függvényt
        onStartQuiz();
    };

    return (
        <section className="central-content">
            <h1>MindQuest</h1>

            <div className="quiz-settings">
                {/* ... csúszkák JSX-e változatlanul ... */}
                <div className="setting-group">
                    <label htmlFor="difficulty-slider">Nehézség:</label>
                    <input
                        type="range"
                        id="difficulty-slider"
                        name="difficulty"
                        min="1"
                        max="5"
                        value={difficulty}
                        step="1"
                        onChange={handleDifficultyChange}
                    />
                    <span>{difficulty}</span>
                </div>

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
                    />
                    <span>{length}</span>
                </div>
            </div>

            {/* A gomb onClick eseménykezelője meghívja a handleStartQuiz függvényt */}
            <button className="start-quiz-button" onClick={handleStartQuiz}>Kvíz indítása</button>

            <p className="description-text">Válassz kategóriát és kezdd el a kihívást!</p>
        </section>
    );
}

export default CentralContent;