// src/components/Layout.tsx - (HOST/FRONTEND)

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import QuizSetupPage from './QuizSetupPage';
import LobbyPage from './LobbyPage';
import TopicSelectionPage from './TopicSelectionPage';
import SettingsPage from './SettingsPage';
import QuestionPage from './QuestionPage';
import PlayerListPanel from './PlayerListPanel';
import StatisticsPage from './StatisticsPage'; // *** Importáljuk az új oldalt ***
import { Page, Player } from '../types';
import ResultsPage from "./ResusltsPage";
import {useAuthenticationHandler} from "../hooks/socketHandlers/useAuthenticationHandler";
import { useQuizSetup } from '../hooks/socketHandlers/useQuizSetupHandler';
// <<< VÁLTOZTATÁS ITT >>>
// import {useApp} from "../context/AppProvider"; // A useApp már be van importálva, de a korábbi sorban volt.
import {useApp} from "../context/AppProvider";
import {MatchProvider} from "../context/MatchProvider"; // <<< useApp importálása
// <<< VÉGE VÁLTOZTATÁS >>>


// A Page típus definíciója továbbra is a types.ts fájlban van

const Layout: React.FC = () => {
    // <<< VÁLTOZTATÁS ITT >>>
    // const initialPageFromStorage = localStorage.getItem('page'); // Ezt a logikát az AppProvider kezeli
    // const { currentPage, setCurrentPage } = useApp(); // <<< useApp hívása
    const { appState, handlePageChange } = useApp(); // <<< useApp hívása
    const currentPage = appState.currentPage; // A jelenlegi oldal az appState-ből jön
    // <<< VÉGE VÁLTOZTATÁS >>>

    // Placeholder Játékos Adatok
    // <<< VÁLTOZTATÁS ITT >>>
    // handlePageChange már a useApp hookból jön, és a localStorage-t is az AppProvider kezelheti (vagy a Layout)
    // A localStorage mentés logikáját is át kell gondolni, hogy hol van a helye.
    // Most a handlePageChange-et használjuk, ami az AppProviderből jön.
    // const handlePageChange = (page: Page) => {
    //     localStorage.setItem('page', page); // Mentjük az ÚJ oldalt a localStorage-ba a frissítéshez
    //     setCurrentPage(page); // Frissítjük a state-et
    // };
    // <<< VÉGE VÁLTOZTATÁS >>>


    useAuthenticationHandler({hostKey: 'jdfghkjdfhg'});

    const renderPage = (page: Page): React.ReactElement | null => { // A paraméter típusa Page lesz
        switch (page) {
            case 'quizSetup':
                return  <QuizSetupPage onGameStart={() => handlePageChange('topicSelection')}/>;
            case 'lobby':
                return <LobbyPage onGameStart={() => handlePageChange('topicSelection')} />;
            case 'topicSelection':
                return <TopicSelectionPage onTopicSelected={() => handlePageChange('game')} />;
            case 'game':
                // Innen kell majd átváltani a ResultsPage-re, ha a játék véget ér
                // Pl. QuestionPage vagy egy GameManagement komponens hív egy propot: onGameEnd={() => handlePageChange('results')}
                return <QuestionPage />;
            case 'settings':
                return <SettingsPage />;
            case 'stats':
                return <StatisticsPage />;
            case 'players': // Teszteléshez most ide tesszük az eredmény oldalt
                return <ResultsPage />; // *** Rendereljük az Eredmény oldalt ***
            case 'ranking':
            case 'contact':
                return <p>Ez a {currentPage} oldal placeholder tartalom!</p>;
            case 'results': // *** ÚJ: Eredmény oldal case ***
                return <ResultsPage />;
            default:
                return <QuizSetupPage onGameStart={() => handlePageChange('topicSelection')}/>;
        }
    };


    return (
        <div className="container">
            <Sidebar onPageChange={handlePageChange} currentPage={currentPage} /> {/* <<< handlePageChange és currentPage használata */}

            <div className="main-area-wrapper">
                {renderPage(currentPage)} {/* <<< currentPage használata */}
                {/* PlayerListPanel mindig itt renderelődik */}
                <PlayerListPanel/>
            </div>
        </div>
    );
}

export default Layout;