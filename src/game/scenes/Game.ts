import Phaser from 'phaser';
import { BLOCK_SIZE } from './utils/pieces';
import { getRandomTetromino, clearCompletedLines } from './utils/helpers';

// TODO Add swap piece
// TODO Add next piece
// TODO Add scores
// TODO Add restrictions if it reach the top border, go to game over scene

class Game extends Phaser.Scene {
    private board: number[][] = [];
    private staticBoardGraphics!: Phaser.GameObjects.Graphics;
    private dynamicBoardGraphics!: Phaser.GameObjects.Graphics;
    private currentPiece!: { shape: number[][]; color: number; x: number; y: number };
    private nextPiece!: { shape: number[][]; color: number };

    private controls = {
        left: 'LEFT',
        right: 'RIGHT',
        down: 'DOWN',
        up: 'UP',
        space: 'SPACE'
    };

    constructor() {
        super({ key: 'Game' });
    }

    preload() {
        // Load game assets
    }

    create() {
        this.createBoard();
        this.staticBoardGraphics = this.add.graphics(); // Static part of the board (grid)
        this.dynamicBoardGraphics = this.add.graphics(); // Dynamic part (pieces)
        this.drawStaticBoard();  // Draw the initial static grid
        this.spawnTetromino();

        // Setup the key controls
        this.input.keyboard.on(`keydown-${this.controls.left}`, () => this.movePiece(-1));
        this.input.keyboard.on(`keydown-${this.controls.right}`, () => this.movePiece(1));
        this.input.keyboard.on(`keydown-${this.controls.down}`, () => this.dropPiece());
        this.input.keyboard.on(`keydown-${this.controls.up}`, () => this.rotatePiece());
        this.input.keyboard.on(`keydown-${this.controls.space}`, () => this.dropPieceImmediately());

        this.time.addEvent({
            delay: 1000,
            callback: this.dropPiece,
            callbackScope: this,
            loop: true,
        });
    }

    createBoard() {
        for (let row = 0; row < 20; row++) {
            this.board[row] = new Array(10).fill(0); // Initialize the empty game board
        }
    }

    drawStaticBoard() {
        const boardWidth = 10 * BLOCK_SIZE;
        const boardHeight = 20 * BLOCK_SIZE;

        const offsetX = (this.scale.width - boardWidth) / 2;
        const offsetY = (this.scale.height - boardHeight) / 2;

        this.staticBoardGraphics.clear();  // Clear any previous static graphics
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                const x = offsetX + col * BLOCK_SIZE;
                const y = offsetY + row * BLOCK_SIZE;
                this.staticBoardGraphics.fillStyle(0x222222, 1);  // Dark color for empty cells
                this.staticBoardGraphics.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
                this.staticBoardGraphics.lineStyle(1, 0xffffff, 1);  // White border for the grid
                this.staticBoardGraphics.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    drawBoard() {
        this.dynamicBoardGraphics.clear();  // Clear previous dynamic graphics
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                if (this.board[row][col] !== 0) {
                    const x = (this.scale.width - 10 * BLOCK_SIZE) / 2 + col * BLOCK_SIZE;
                    const y = (this.scale.height - 20 * BLOCK_SIZE) / 2 + row * BLOCK_SIZE;
                    this.dynamicBoardGraphics.fillStyle(this.board[row][col], 1);  // Locked piece color
                    this.dynamicBoardGraphics.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
                    this.dynamicBoardGraphics.lineStyle(1, 0xffffff, 1);  // White border for locked pieces
                    this.dynamicBoardGraphics.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
        this.drawTetromino();  // Draw the current active tetromino
    }

    spawnTetromino() {
        this.currentPiece = getRandomTetromino();
        this.currentPiece.x = Math.floor(this.board[0].length / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentPiece.y = 0;
        this.drawTetromino();  // Draw the new active piece

        // Check for game over: if the new piece collides at the top
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.scene.start('GameOver');  // Trigger the game over sequence
        } else {
            this.drawTetromino();  // Draw the new active piece
        }

    }

    drawTetromino() {
        const { shape, color, x, y } = this.currentPiece;

        const offsetX = (this.scale.width - 10 * BLOCK_SIZE) / 2;
        const offsetY = (this.scale.height - 20 * BLOCK_SIZE) / 2;

        shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const xPos = offsetX + (x + colIndex) * BLOCK_SIZE;
                    const yPos = offsetY + (y + rowIndex) * BLOCK_SIZE;

                    this.dynamicBoardGraphics.fillStyle(color, 1);
                    this.dynamicBoardGraphics.fillRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);

                    this.dynamicBoardGraphics.lineStyle(2, 0xffffff, 1);
                    this.dynamicBoardGraphics.strokeRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }

    movePiece(dx: number) {
        if (this.currentPiece && !this.checkCollision(this.currentPiece, dx, 0)) {
            this.currentPiece.x += dx;
            this.drawBoard(); // Redraw only the board layout (locked pieces + grid)
        }
    }

    dropPiece() {
        if (this.currentPiece && !this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y += 1;  // Move the piece down by one row
            this.drawBoard(); // Redraw the board layout
        } else {
            // Lock the piece when it can't move down anymore
            this.lockTetromino();
            this.spawnTetromino();  // Spawn the next piece
        }
    }

    dropPieceImmediately() {
        let moved = false;
        while (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y += 1;  // Move the piece down
            moved = true;
        }

        if (moved) {
            this.lockTetromino();
            this.spawnTetromino();  // Spawn the next piece
            this.drawBoard(); // Redraw once after moving the piece
        }
    }

    rotatePiece() {
        const newShape = this.rotateMatrix(this.currentPiece.shape);
        if (!this.checkCollision({ ...this.currentPiece, shape: newShape }, 0, 0)) {
            this.currentPiece.shape = newShape;
            this.drawBoard(); // Redraw the board layout
        }
    }

    rotateMatrix(matrix: number[][]): number[][] {
        return matrix[0].map((_, index) => matrix.map(row => row[index])).reverse();
    }

    checkCollision(piece: { shape: number[][]; x: number; y: number }, dx: number, dy: number): boolean {
        const { shape, x, y } = piece;

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col + dx;
                    const newY = y + row + dy;
                    if (newX < 0 || newX >= 10 || newY >= 20 || this.board[newY] && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    lockTetromino() {
        const { shape, x, y, color } = this.currentPiece;
        shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const boardX = x + colIndex;
                    const boardY = y + rowIndex;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = color; // Lock piece on the board
                    }
                }
            });
        });

        // Clear completed lines after locking the piece
        this.board = clearCompletedLines(this.board);  // Call utility function to clear lines
        this.drawBoard(); // Redraw the board with cleared lines
    }
}

export default Game;
