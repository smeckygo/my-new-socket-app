import React from 'react';
import logo from './logo.svg';
import './App.css';
import Layout from "./components/Layout";
import {AppProvider} from "./context/AppProvider";
import {PlayerProvider} from "./context/PlayerProvider";
import {MatchProvider} from "./context/MatchProvider";

function App() {
  return (
    <AppProvider>
        <MatchProvider>
            <PlayerProvider>
                <Layout />
            </PlayerProvider>
        </MatchProvider>
    </AppProvider>
  );
}

export default App;
