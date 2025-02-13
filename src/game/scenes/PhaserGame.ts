import Phaser from 'phaser';
import Start from './Start';
import Game from './Game';
import GameOver from './GameOver';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    // width: 800,
    // height: 600,
    scene: [ Start, Game, GameOver ], // Registers game scenes
    parent: 'game-container', // Mounts Phaser inside this div || game is mounted inside the #game-container div inside App.tsx
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game-container',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // width: 1368,
        // height: 768,
        width: 1920,
        height: 800
    }
};

class PhaserGame extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
}

export default new PhaserGame(config);


