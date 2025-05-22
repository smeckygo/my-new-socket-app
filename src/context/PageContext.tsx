// src/context/PageContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { PlayerAppState } from '../types';

interface PageContextProps {
    currentPage: PlayerAppState;
    setCurrentPage: (page: PlayerAppState) => void;
}

const PageContext = createContext<PageContextProps | undefined>(undefined);

export const PageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialPage = localStorage.getItem('page') as PlayerAppState ?? 'quizSetup';
    const [currentPage, setCurrentPage] = useState<PlayerAppState>(initialPage);

    const handleSetCurrentPage = (page: PlayerAppState) => {
        localStorage.setItem('page', page);
        setCurrentPage(page);
    };

    return (
        <PageContext.Provider value={{ currentPage, setCurrentPage: handleSetCurrentPage }}>
            {children}
        </PageContext.Provider>
    );
};

export const usePage = (): PageContextProps => {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error('usePage must be used within a PageProvider');
    }
    return context;
};
