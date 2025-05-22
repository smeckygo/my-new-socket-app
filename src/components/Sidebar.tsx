// src/components/Sidebar.tsx
import React from 'react';
import { Page } from '../types'; // Import Page from the shared types file

// Define the Sidebar prop types
interface SidebarProps {
    onPageChange: (page: Page) => void; // Function to change the current page
    currentPage: Page; // The currently active page
}

const Sidebar: React.FC<SidebarProps> = ({ onPageChange, currentPage }) => {
    return (
        <aside className="sidebar">
            {/* Minden menüpontra kattintva meghívjuk az onPageChange függvényt a megfelelő oldallal */}

            {/* Kezdőlap -> Quiz Setup Page */}
            <div
                className={`sidebar-item ${currentPage === 'quizSetup' ? 'active' : ''}`}
                onClick={() => onPageChange('quizSetup')}
            >
                <i className="fas fa-home"></i>
                <span>Quiz Setup</span> {/* Changed text */}
            </div>

            {/* Statisztikák -> Lobby Page (Teszteléshez) */}
            <div
                className={`sidebar-item ${currentPage === 'lobby' ? 'active' : ''}`}
                onClick={() => onPageChange('lobby')}
            >
                <i className="fas fa-chart-bar"></i>
                <span>Lobby</span> {/* Changed text */}
            </div>

            {/* Játékosok -> Topic Selection Page (Teszteléshez) */}
            <div
                className={`sidebar-item ${currentPage === 'topicSelection' ? 'active' : ''}`}
                onClick={() => onPageChange('topicSelection')}
            >
                <i className="fas fa-users"></i>
                <span>Topic Selection</span> {/* Changed text */}
            </div>

            {/* Játékosok -> Results Page (Teszteléshez) */}
            <div
                className={`sidebar-item ${currentPage === 'results' ? 'active' : ''}`} // Aktív, ha az oldal 'results'
                onClick={() => onPageChange('results')} // <-- Átvált 'results' oldalra
            >
                <i className="fas fa-users"></i>
                <span>Eredmények (Teszt)</span> {/* <-- Megváltozott szöveg */}
            </div>

            {/* Beállítások -> Settings Page */}
            <div
                className={`sidebar-item ${currentPage === 'settings' ? 'active' : ''}`}
                onClick={() => onPageChange('settings')}
            >
                <i className="fas fa-cog"></i>
                <span>Beállítások</span> {/* Text remains, goes to Settings Page */}
            </div>

            {/* Rangsor -> Game Page (Teszteléshez) */}
            <div
                className={`sidebar-item ${currentPage === 'game' ? 'active' : ''}`}
                onClick={() => onPageChange('game')}
            >
                <i className="fas fa-trophy"></i>
                <span>Question Page</span> {/* Changed text */}
            </div>

            {/* Statisztikák -> Statistics Page */}
            <div
                className={`sidebar-item ${currentPage === 'stats' ? 'active' : ''}`} // Aktív, ha az oldal 'stats'
                onClick={() => onPageChange('stats')} // <-- Átvált 'stats' oldalra
            >
                <i className="fas fa-chart-bar"></i>
                <span>Statisztikák</span> {/* <-- Visszaírva az eredeti szöveg */}
            </div>


            {/* Kapcsolat -> Contact Page (Placeholder) */}
            <div
                className={`sidebar-item ${currentPage === 'contact' ? 'active' : ''}`}
                onClick={() => onPageChange('contact')}
            >
                <i className="fas fa-envelope"></i>
                <span>Contact Page</span> {/* Changed text */}
            </div>


            {/* Kilépés - Ez más logikát igényel */}
            <div className="sidebar-item bottom" onClick={() => console.log('Kilépés logic here')}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Kilépés</span> {/* Text remains */}
            </div>
        </aside>
    );
}

export default Sidebar;