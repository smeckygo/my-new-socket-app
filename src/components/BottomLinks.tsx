// src/components/BottomLinks.tsx
import React from 'react';

const BottomLinks: React.FC = () => { // Helyes típusolás
    return (
        <footer className="bottom-links">
            <a href="#"><i className="fas fa-book"></i> Szabályok</a>
            <a href="#"><i className="fas fa-trophy"></i> Rangsor</a>
            <a href="#"><i className="fas fa-envelope"></i> Kapcsolat</a>
        </footer>
    );
}

export default BottomLinks;