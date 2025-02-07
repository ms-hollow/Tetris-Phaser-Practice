import Phaser from 'phaser';

class Start extends Phaser.Scene {
    constructor() {
        super({ key: 'Start' });
    }

    preload() {
        // Load game assets
        this.load.setPath('assets');
        this.load.image('background', 'bg.jpg');
    }

    create() {
        // set background
        const background = this.add.image(0, 0, 'background').setOrigin(0);
        background.setDisplaySize(this.scale.width, this.scale.height);

        //game title 
        this.add.text(this.scale.width/2, this.scale.height * 0.3, 'TETRIS', {fontFamily:'Arial', fontSize:'90px', color:'#ffffff'}).setOrigin(0.5);

        let playButton = this.add.text(this.scale.width / 2, this.scale.height * 0.7, 'PLAY', {
            fontFamily: 'Arial',
            fontSize:'60px',
            color: '#0c0e47',
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('Game'); // Kapag pinindot, start game // punta sa game scene
        })
        .on('pointerover', () => {
            playButton.setStyle({ color: '#383fff' }); // change text color when hover
        })
        .on('pointerout', () => {
            playButton.setStyle({ color: '#ffffff' }); // change text color back to orig color
        });
    }
}

export default Start;