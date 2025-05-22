// src/components/StatisticsPage.tsx (Modified Layout)
import React from 'react';
import TopBar from './TopBar';
// Jobb panel renderelését a Layout kezeli

// import './StatisticsPage.css'; // Külön CSS

// Placeholder Player Statistics Data for the current user (replace with actual data)
const placeholderCurrentUserStats = {
    totalGamesPlayed: 50,
    gamesWon: 35,
    winRate: "70%", // Calculated
    totalScore: 5200,
    bestScoreInGame: 250,
};

// Placeholder Top Players Data (replace with actual data from server)
const placeholderTopPlayers = [
    { id: 'tp1', name: 'GameGuru1', score: 1500, rank: 2 },
    { id: 'tp2', name: 'ElitePlayer1', score: 1200, rank: 1 },
    { id: 'tp3', name: 'ProQuizzler3', score: 1000, rank: 3 },
];

// Placeholder Overall Match Statistics Data (replace with actual data from server)
const placeholderOverallMatchStats = {
    totalMatchesCompleted: 1000,
    averageMatchDuration: "15 perc",
    mostPopularTopic: "Történelem",
    // Add other relevant overall stats
};


function StatisticsPage(): React.JSX.Element {
    // State a statisztikai adatok tárolására (ezek majd a szerverről jönnek)
    // const [currentUserStats, setCurrentUserStats] = useState<typeof placeholderCurrentUserStats | null>(null);
    // const [topPlayers, setTopPlayers] = useState<typeof placeholderTopPlayers | null>(null);
    // const [overallMatchStats, setOverallMatchStats] = useState<typeof placeholderOverallMatchStats | null>(null);

    // useEffect a statisztikai adatok szerverről történő betöltéséhez... (később)
    // For now, use placeholder data directly

    // Helper function to find player by rank
    const getPlayerByRank = (rank: number) => placeholderTopPlayers.find(p => p.rank === rank);

// Define the order of rendering (Rank 2, then Rank 1, then Rank 3)
    const displayOrder = [2, 1, 3];

    return (
        <>
            <main className="main-content-area">
                <TopBar />

                <section className="statistics-content"> {/* Fő konténer a statisztikáknak */}
                    <h2>Statisztikák</h2>

                    {/* --- Top 3 Játékos (Ranglista) --- */}
                    <h3>Ranglista - Top 3</h3>
                    <div className="top-players-container"> {/* Flexbox konténer a Top 3 játékos kártyáknak */}
                        {/* Render players in the desired visual order (Rank 2, then 1, then 3) */}
                        {displayOrder.map(rank => {
                            const player = getPlayerByRank(rank);
                            if (!player) return null; // Handle case where player not found (shouldn't happen with placeholder)

                            return (
                                <div key={player.id} className={`top-player-card rank-${player.rank}`}>
                                    <span className="top-player-rank-badge">{player.rank}</span>
                                    <div className="top-player-avatar">
                                        {player.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="top-player-info">
                                        <span className="top-player-name">{player.name}</span>
                                        <span className="top-player-score">{player.score} pont</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* --- Elválasztó Vonal --- */}
                    <hr className="stats-separator" /> {/* Vizuális elválasztó */}


                    {/* --- Összes Meccs Statisztika --- */}
                    <h3>Meccs Statisztikák (Összesítve)</h3> {/* Cím az összesített meccs statisztikáknak */}
                    <div className="statistics-section match-stats"> {/* Újrahasználjuk a statistics-section-t, specifikus osztállyal */}
                        {/* Itt jelennek meg a meccsekre vonatkozó összesített statisztikák */}
                        <div className="match-stats-list player-stats-list"> {/* Újrahasználjuk a player-stats-list Grid stílusát */ }
                            <div className="stat-item">
                                <span className="stat-label">Összes lejátszott meccs:</span>
                                <span className="stat-value">{placeholderOverallMatchStats.totalMatchesCompleted}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Átlagos meccs időtartam:</span>
                                <span className="stat-value">{placeholderOverallMatchStats.averageMatchDuration}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Legnépszerűbb téma:</span>
                                <span className="stat-value">{placeholderOverallMatchStats.mostPopularTopic}</span>
                            </div>
                        </div>
                    </div>

                    {/* Achievements Szekció (marad placeholder egyelőre) */}
                    {/* Ezt a szekciót is lehet statistics-section-ként kezelni, ha szükséges */}
                    <div className="statistics-section achievements-section">
                        <h3>Achievements</h3>
                        <p>Ide jönnek majd az achievement-ek.</p>
                    </div>


                </section>

            </main>
        </>
    );
}

export default StatisticsPage;