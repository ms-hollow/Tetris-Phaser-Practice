import React, { useEffect } from 'react';
import './App.css';
import PhaserGame from './game';

function App() {
  useEffect(() => {
    PhaserGame; // imports the game logic
  }, []);

  return <div id="game-container"></div> // PhaserGame instance gets mounted inside a <div id="game-container"></div>, which is used in Phaser’s config
}

export default App;