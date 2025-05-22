// src/components/TopBar.tsx
import React from 'react';

const TopBar: React.FC = () => { // Helyes típusolás
    return (
        <header className="top-bar">
            <div className="user-info">
                <span className="user-avatar">J</span>
                <span className="user-name">James</span>
                <span className="user-score">1230</span>
            </div>
        </header>
    );
}

export default TopBar;