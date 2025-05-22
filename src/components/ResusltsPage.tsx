// src/components/ResultsPage.tsx
import React from 'react';
import TopBar from './TopBar';
// Jobb panel renderelését a Layout kezeli, nem itt

// import './ResultsPage.css'; // Külön CSS, ha kell

// Placeholder Final Results Data (replace with actual data from server)
const placeholderFinalResults = [
    { id: 'p1', name: 'ElitePlayer1', score: 1500, rank: 1 },
    { id: 'p2', name: 'GamerGuru2', score: 1200, rank: 2 },
    { id: 'p3', name: 'ProQuizzler3', score: 1000, rank: 3 },
    { id: 'p4', name: 'Alice', score: 800, rank: 4 },
    { id: 'p5', name: 'Bob', score: 600, rank: 5 },
    { id: 'p6', name: 'Charlie', score: 400, rank: 6 },
];

// Sort results by rank to ensure correct order in list
const sortedResults = [...placeholderFinalResults].sort((a, b) => a.rank - b.rank);


function ResultsPage(): React.JSX.Element {
    // State a eredmény adatok tárolására (valószínűleg propként jön a szülőtől)
    // const [results, setResults] = useState<Player[] | null>(null);


    // useEffect a eredmény adatok fogadására/töltésére... (később)


    return (
        // A fő layout struktúra a Layout komponensben van.
        <> {/* Fragment használata */}
            {/* A fő tartalom terület */}
            <main className="main-content-area">

                {/* A felső sáv */}
                <TopBar />

                {/* Az eredmények tartalom rész */}
                <section className="results-content"> {/* Új szekció az eredmény tartalomnak */}
                    <h2>Játék Vége!</h2>
                    <h3>Végeredmény</h3>

                    {/* Végső Rangsor Lista */}
                    <div className="final-rankings"> {/* Konténer a végső rangsornak */}
                        {sortedResults.length === 0 ? (
                            <p className="no-results-message">Nincsenek eredmények.</p>
                        ) : (
                            sortedResults.map(player => (
                                // Egyedi játékos eredmény sor
                                <div key={player.id} className={`player-result rank-${player.rank} ${player.rank === 1 ? 'is-winner' : ''}`}> {/* Class a rank alapján és winner class */}
                                    <span className="result-rank">{player.rank}.</span>
                                    <span className="result-name">{player.name}</span>
                                    <span className="result-score">{player.score} pont</span>
                                    {/* Opcionális: Jelvény a győztesnek */}
                                    {player.rank === 1 && <i className="fas fa-crown winner-crown"></i>}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Játék Utáni Gombok */}
                    <div className="post-game-actions"> {/* Konténer a gomboknak */}
                        <button className="post-game-button play-again">Új Játék</button>
                        <button className="post-game-button back-to-lobby">Vissza a Várószobába</button>
                        <button className="post-game-button main-menu">Főmenü</button>
                    </div>


                </section>

            </main> {/* Fő tartalom vége */}

            {/* Jobb panel renderelését a Layout kezeli */}

        </> // Záró Fragment tag
    );
}

export default ResultsPage;