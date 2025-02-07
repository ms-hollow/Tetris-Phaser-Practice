import Phaser from 'phaser';

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOver' }); // Scene key
    }

    init() {
    }

    preload() {
        // Load assets if needed
    }

    create() {
        this.add.text(this.scale.width/2, this.scale.height * 0.3, 'GAME OVER', {fontFamily:'Arial', fontSize:'90px', color:'#ffffff'}).setOrigin(0.5);
    }
}

export default GameOverScene;
