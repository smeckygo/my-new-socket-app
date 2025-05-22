// src/components/SettingsPage.tsx
import React from 'react';
import TopBar from './TopBar'; // Valószínűleg itt is megmarad

// import './SettingsPage.css'; // Külön CSS, ha modulárisabb akarsz lenni

function SettingsPage(): React.JSX.Element {
    return (
        <div className="main-area-wrapper"> {/* Ugyanaz a wrapper div */}
            <main className="main-content-area"> {/* Ugyanaz a main tartalom terület */}
                <TopBar /> {/* A TopBar valószínűleg minden oldalon látszik */}

                <section className="settings-content"> {/* Új szekció a beállítások tartalomnak */}
                    <h2>Beállítások</h2>

                    <div className="settings-section">
                        <h3>Felhasználói fiók</h3>
                        <p>Itt lesznek a fiók beállítások (pl. jelszócsere, profilkép).</p>
                        {/* Ide jönnének majd a beviteli mezők és gombok */}
                    </div>

                    <div className="settings-section">
                        <h3>Játék beállítások</h3>
                        <p>Itt lesznek a játékhoz kapcsolódó beállítások (pl. hang, grafika minősége).</p>
                        {/* Ide jönnének majd a beviteli mezők és gombok */}
                    </div>

                    <div className="settings-section">
                        <h3>Kommunikáció</h3>
                        <p>Itt lehetnek a chat vagy értesítések beállításai.</p>
                        {/* Ide jönnének majd a beviteli mezők és gombok */}
                    </div>

                    {/* ... további beállítási szekciók ... */}

                </section>

                {/* Az alsó linkek valószínűleg itt sem kellenek */}
                {/* <BottomLinks /> */}

            </main>
        </div>
    );
}

export default SettingsPage;