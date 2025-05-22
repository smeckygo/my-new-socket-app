// src/components/QuestionPage.tsx (Modify Answer Button JSX)
import React, { useState, useEffect, useRef } from 'react';
import TopBar from './TopBar';
// Right panel is handled by Layout

// import './QuestionPage.css'; // Külön CSS

// Példa adatok egy kérdéshez (kiegészítve helyes válasszal)
const currentQuestion = {
    number: 1,
    topic: "Tudomány",
    text: "Melyik évben szállt először ember a Holdra?",
    options: [
        { id: 'a', text: "1965" },
        { id: 'b', text: "1969" }, // This is the correct answer
        { id: 'c', text: "1971" },
        { id: 'd', text: "1975" },
    ],
    correctAnswerId: 'b', // Added correct answer ID
    timer: 5 // Time limit in seconds (0 means no limit)
};

// Placeholder Player Answers for the reveal phase (replace with actual data from server)
const placeholderPlayerAnswers = [
    { playerId: 'p1', playerName: 'James (You)', chosenAnswerId: 'b', scoreChange: 50 }, // Correct answer
    { playerId: 'p2', playerName: 'Alice', chosenAnswerId: 'a', scoreChange: 0 }, // Incorrect answer
    { playerId: 'p3', playerName: 'Bob', chosenAnswerId: 'b', scoreChange: 50 }, // Correct answer
    { playerId: 'p4', playerName: 'Charlie', chosenAnswerId: 'c', scoreChange: 0 }, // Incorrect answer
    { playerId: 'p5', playerName: 'David', chosenAnswerId: 'b', scoreChange: 50 }, // Another correct answer
    { playerId: 'p6', playerName: 'Eve', chosenAnswerId: 'd', scoreChange: 0 }, // Another incorrect answer
];


const CIRCLE_CIRCUMFERENCE = 100;
const FLASH_ANIMATION_DURATION = 3 * 0.3 * 1000; // Total animation duration in ms

type QuestionPhase = 'answering' | 'revealing';

function QuestionPage(): React.JSX.Element {
    const [phase, setPhase] = useState<QuestionPhase>('answering');
    const [questionRemainingTime, setQuestionRemainingTime] = useState<number>(currentQuestion.timer > 0 ? currentQuestion.timer : 0);
    const questionProgressBarCircleRef = useRef<SVGCircleElement>(null);

    // Refek és logika a témaválasztás animációhoz... (ha még itt maradtak)
    // Valszínűleg ezek már nincsenek itt, mivel ez a QuestionPage.

    // Ha a témaválasztó oldalon kezeli a visszaszámlálást,
    // akkor itt a kérdés időzítőjét kell kezelni.
    // A fenti useEffect-ek a kérdés időzítőhöz tartoznak.

    // useEffect a visszaszámláló logikához... (Phase és timer based)
    useEffect(() => {
        // ... (existing timer logic) ...
        if (phase === 'answering' && currentQuestion.timer > 0 && questionRemainingTime > 0) {
            const timerInterval = setInterval(() => {
                setQuestionRemainingTime((prevTime: number) => prevTime - 1);
            }, 1000);
            return () => clearInterval(timerInterval);
        } else if (phase === 'answering' && currentQuestion.timer > 0 && questionRemainingTime === 0) {
            console.log("Kérdés idő lejárt!");
            setPhase('revealing');
        }
        // Ha nincs időlimit (timer === 0) és phase === 'answering',
        // kellene egy esemény (pl. mindenki válaszolt), ami átvált revealingre.
        // Most a designhoz manuálisan váltunk át, ha nincs időlimit VAGY lejárt az idő.
        // Pl. egy gombnyomással vagy a szerver jelzésére.
        // A teszteléshez a Sidebar linkkel lépsz ide, és az időzítő indítja a reveal fázist, ha van.
        // Ha nincs időlimit, a reveal manuálisan váltandó a tesztben.

    }, [questionRemainingTime, currentQuestion.timer, phase]);


    // Effekt a progress bar vizuális frissítéséhez... (Phase és timer based)
    useEffect(() => {
        if (phase === 'answering' && currentQuestion.timer > 0 && questionProgressBarCircleRef.current) {
            const percentageRemaining = questionRemainingTime / currentQuestion.timer;
            const offset = CIRCLE_CIRCUMFERENCE * Math.max(0, (1 - (currentQuestion.timer > 0 ? percentageRemaining : 0)));
            questionProgressBarCircleRef.current.style.strokeDashoffset = offset.toString();
        }
    }, [questionRemainingTime, currentQuestion.timer, phase]);


    return (
        <div className="main-area-wrapper">
            <main className="main-content-area">
                <TopBar />

                <section className="question-content">
                    <h2>Kérdés {currentQuestion.number} - {currentQuestion.topic}</h2>

                    <p className="question-text">{currentQuestion.text}</p>

                    {/* Válaszlehetőségek megjelenítése */}
                    <div className="answer-options">
                        {currentQuestion.options.map(option => (
                            <button
                                key={option.id}
                                className={`answer-button
                                ${phase === 'revealing' && option.id === currentQuestion.correctAnswerId ? 'is-correct' : ''}
                            `}
                                disabled={phase === 'revealing'}
                                // onClick eseménykezelő csak az 'answering' fázisban
                                // onClick={phase === 'answering' ? () => handleAnswerClick(option.id) : undefined}
                            >
                                <span className="option-id">{option.id.toUpperCase()}.</span>
                                <span className="option-text">{option.text}</span>

                                {/* *** Játékos indikátorok hozzáadása Reveal fázisban *** */}
                                {/* Ez a div csak akkor jelenik meg, ha phase === 'revealing' */}
                                {phase === 'revealing' && (
                                    <div className="players-who-chose">
                                        {/* Iterálunk a játékos válaszokon */}
                                        {placeholderPlayerAnswers
                                            .filter(playerAnswer => playerAnswer.chosenAnswerId === option.id) // Csak azok a játékosok, akik ezt az opciót választották
                                            .map(playerAnswer => (
                                                // Egyedi játékos indikátor
                                                <div key={playerAnswer.playerId} className="chosen-player-indicator">
                                                    {/* Avatar placeholder (első betű) */}
                                                    {playerAnswer.playerName.charAt(0).toUpperCase()}
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}

                            </button>
                        ))}
                    </div>

                    {/* Kérdés visszaszámláló (Csak ha van időlimit > 0 és phase === 'answering') */}
                    {currentQuestion.timer > 0 && phase === 'answering' && (
                        <div className="timer-container question-timer">
                            <svg className="circular-progress" viewBox="0 0 36 36">
                                <circle
                                    className="circle-bg"
                                    cx="18" cy="18" r="16"
                                    strokeWidth="2"
                                ></circle>
                                <circle
                                    className="circle-progress"
                                    cx="18" cy="18" r="16"
                                    strokeWidth="2"
                                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                                    strokeDashoffset={CIRCLE_CIRCUMFERENCE}
                                    ref={questionProgressBarCircleRef}
                                ></circle>
                            </svg>
                            <span className="timer-value">{questionRemainingTime > 0 ? questionRemainingTime : ''}</span>
                        </div>
                    )}

                    {/* Eredmény Felfedés (Reveal) Tartalom - A játékosok listája válaszokkal és pontszámokkal (ez most külön van) */}
                    {/* Ha a játékos válaszok listája külön szekcióban marad, akkor itt jelenik meg: */}
                    {/* {phase === 'revealing' && ( ... reveal content div with player answers list ... )} */}


                </section>

            </main>
            {/* Right Panel renderelését a Layout kezeli */}
        </div>
    );
}

export default QuestionPage;