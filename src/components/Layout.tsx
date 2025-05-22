// src/components/Layout.tsx

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import QuizSetupPage from './QuizSetupPage';
import LobbyPage from './LobbyPage';
import TopicSelectionPage from './TopicSelectionPage';
import SettingsPage from './SettingsPage';
import QuestionPage from './QuestionPage';
import PlayerListPanel from './PlayerListPanel';
import StatisticsPage from './StatisticsPage';
import { Page } from '../types'; // Removed Player import as it's not used directly here
import ResultsPage from "./ResusltsPage";
import {useAuthenticationHandler} from "../hooks/socketHandlers/useAuthenticationHandler";
import { useApp } from "../context/AppProvider";

const Layout: React.FC = () => {
    const { appState, handlePageChange } = useApp();
    const currentPage = appState.currentPage;

    useAuthenticationHandler({hostKey: 'jdfghkjdfhg'});

    const renderPage = (page: Page): React.ReactElement | null => {
        switch (page) {
            case 'quizSetup':
                return  <QuizSetupPage onGameStart={() => handlePageChange('topicSelection')}/>;
            case 'lobby':
                return <LobbyPage onGameStart={() => handlePageChange('topicSelection')} />;
            case 'topicSelection':
                return <TopicSelectionPage onTopicSelected={() => handlePageChange('game')} />;
            case 'game':
                return <QuestionPage />;
            case 'settings':
                return <SettingsPage />;
            case 'stats':
                return <StatisticsPage />;
            case 'players': // This page is used for testing results currently
                return <ResultsPage />;
            case 'ranking':
            case 'contact':
                return <p>Ez a {currentPage} oldal placeholder tartalom!</p>;
            case 'results':
                return <ResultsPage />;
            default:
                return <QuizSetupPage onGameStart={() => handlePageChange('topicSelection')}/>;
        }
    };

    return (
        <div className="container">
            <Sidebar onPageChange={handlePageChange} currentPage={currentPage} />

            <div className="main-area-wrapper">
                {renderPage(currentPage)}
                <PlayerListPanel /> {/* Eltávolítva: players={connectedPlayers} */}
            </div>
        </div>
    );
}

export default Layout;