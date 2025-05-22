// src/components/TopicSelectionPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import TopBar from './TopBar';

const topics = [
    "Tudomány",
    "Történelem",
    "Filmek",
    "Sport"
];

const CIRCLE_CIRCUMFERENCE = 100;
const FLASH_ANIMATION_DURATION = 3 * 0.3 * 1000; // Total animation duration in ms

// *** DEFINE PROPS INTERFACE ***
interface TopicSelectionPageProps {
    onTopicSelected: () => void; // Add the new prop type here
    // Maybe add the selected topic index as an argument later: onTopicSelected: (selectedTopicIndex: number) => void;
}


const TopicSelectionPage: React.FC<TopicSelectionPageProps> = ({ onTopicSelected }) => {
    const timerDuration = 10;
    const [remainingTime, setRemainingTime] = useState<number>(timerDuration);
    const [animatingTopicIndex, setAnimatingTopicIndex] = useState<number | null>(null);
    const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);

    const progressBarCircleRef = useRef<SVGCircleElement>(null);
    const lastAnimatingTopicIndexRef = useRef<number | null>(null);

    const topicItemRefs = useRef<Array<HTMLDivElement | null>>([]);
    if (topicItemRefs.current.length !== topics.length) {
        topicItemRefs.current = Array(topics.length).fill(null);
    }


    // EFFECT 1: Visszaszámláló logika (másodpercenkénti frissítés)
    useEffect(() => {
        if (remainingTime > 0 && selectedTopicIndex === null) {
            const timerInterval = setInterval(() => {
                setRemainingTime((prevTime) => prevTime - 1);
            }, 1000);
            return () => clearInterval(timerInterval);
        } else if (remainingTime === 0 && selectedTopicIndex === null) {
            console.log("Idő lejárt! Végleges téma kiválasztása...");
            const finalTopicIndex = lastAnimatingTopicIndexRef.current !== null
                ? lastAnimatingTopicIndexRef.current
                : Math.floor(Math.random() * topics.length);

            setSelectedTopicIndex(finalTopicIndex); // Beállítjuk a kiválasztott téma indexét
            setAnimatingTopicIndex(null); // Megállítjuk az animációt
            // IDE JÖN A LOGIKA A KÖVETKEZŐ OLDALRA LÉPÉSHEZ
            // Miután a villogás animáció lefutott, hívjuk meg a onTopicSelected propot
            // Ehhez a selection effect hook-ot kell használni (Effect 4)
        } else if (selectedTopicIndex !== null) {
            setAnimatingTopicIndex(null);
        }
    }, [remainingTime, selectedTopicIndex, onTopicSelected]); // Add onTopicSelected to dependency array


    // EFFECT 2: Progress bar vizuális frissítése - Marad változatlan
    useEffect(() => {
        if (progressBarCircleRef.current) {
            const percentageRemaining = remainingTime / timerDuration;
            const offset = CIRCLE_CIRCUMFERENCE * Math.max(0, (1 - percentageRemaining));
            progressBarCircleRef.current.style.strokeDashoffset = offset.toString();
        }
    }, [remainingTime, timerDuration]);


    // EFFECT 3: Véletlenszerű téma animáció logika - Marad változatlan, függőségekkel
    useEffect(() => {
        let randomTopicInterval: NodeJS.Timeout;
        if (remainingTime > 0 && selectedTopicIndex === null) {
            randomTopicInterval = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * topics.length);
                setAnimatingTopicIndex(randomIndex);
                lastAnimatingTopicIndexRef.current = randomIndex;
            }, 300);
        } else {
            setAnimatingTopicIndex(null);
        }
        return () => {
            if (randomTopicInterval) {
                clearInterval(randomTopicInterval);
            }
        };
    }, [remainingTime, selectedTopicIndex]);


    // EFFECT 4: Villogás animáció indítása és oldalváltás, amikor a téma kiválasztásra kerül
    useEffect(() => {
        // Csak akkor fusson, ha selectedTopicIndex null-ról számra változik
        if (selectedTopicIndex !== null && topicItemRefs.current[selectedTopicIndex]) {
            const selectedElement = topicItemRefs.current[selectedTopicIndex];
            if (selectedElement) {
                // Adjuk hozzá a villogó class-t
                selectedElement.classList.add('is-flashing');

                // Távolítsuk el a class-t az animáció végén ÉS hívjuk meg az oldalváltó propot
                const timer = setTimeout(() => {
                    selectedElement.classList.remove('is-flashing');
                    // *** HÍVJUK MEG AZ OLDALVÁLTÓ PROPOT ITT! ***
                    onTopicSelected(); // Hívjuk meg a Layout-tól kapott propot
                }, FLASH_ANIMATION_DURATION); // Az animáció teljes időtartama

                // Tisztító függvény
                return () => {
                    selectedElement.classList.remove('is-flashing');
                    clearTimeout(timer);
                };
            }
        }
        // Add onTopicSelected to dependency array because it's used in the effect
    }, [selectedTopicIndex, onTopicSelected]); // Add onTopicSelected to dependency array


    return (
        <div className="main-area-wrapper">
            <main className="main-content-area">
                <TopBar />

                <section className="topic-selection-content">
                    <h2>Téma kiválasztása</h2>

                    <div className="topic-container">
                        {topics.map((topic, index) => (
                            <div
                                key={index}
                                ref={el => { topicItemRefs.current[index] = el; }}
                                className={`topic-item
                                ${animatingTopicIndex === index ? 'is-selecting' : ''}
                                ${selectedTopicIndex === index ? 'is-selected' : ''}
                            `}
                            >
                                <span>{topic}</span>
                            </div>
                        ))}
                    </div>

                    {/* Üzenetek */}
                    {remainingTime > 0 && selectedTopicIndex === null && (
                        <p className="selection-message">A téma kiválasztása folyamatban...</p>
                    )}
                    {selectedTopicIndex !== null && (
                        <p className="selection-message">Kiválasztott téma:</p>
                    )}
                    {selectedTopicIndex !== null && (
                        <p className="selected-topic-name">{topics[selectedTopicIndex]}</p>
                    )}


                    <div className="timer-container">
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
                                ref={progressBarCircleRef}
                            ></circle>
                        </svg>
                        <span className="timer-value">{remainingTime > 0 ? remainingTime : 'Go!'}</span>
                    </div>

                </section>

            </main>
        </div>
    );
}

export default TopicSelectionPage;