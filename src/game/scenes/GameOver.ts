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

    create(data: { score: number }) {
        this.add.text(this.scale.width / 2, this.scale.height * 0.3, 'GAME OVER', { fontFamily: 'Arial', fontSize: '90px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(this.scale.width / 2, this.scale.height * 0.5, `Score: ${data.score}`, { fontFamily: 'Arial', fontSize: '40px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(this.scale.width / 2, this.scale.height * 0.7, 'Press SPACE to Restart', { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(this.scale.width / 2, this.scale.height * 0.8, 'Press S to go Start', { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);


        const car = this.add.image(this.scale.width / 2, this.scale.height * 0.6, 'car')
        .setOrigin(0.5) // Centers the image
        .setDisplaySize(100, 90);


        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('Game'); // Restart the game scene
        });

        this.input.keyboard.on('keydown-S', () => {
            this.scene.start('Start'); // Go back to the start scene
        });
    }
}

export default GameOverScene;
