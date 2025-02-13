import Phaser from 'phaser';
import { BLOCK_SIZE } from '../utils/pieces';
import { getRandomTetromino, clearCompletedLines } from '../utils/helpers';

// TODO Add scores

class Game extends Phaser.Scene {
    private board: number[][] = [];
    private initBoard!: Phaser.GameObjects.Graphics;
    private renderBoard!: Phaser.GameObjects.Graphics;
    private currentPiece!: { shape: number[][]; color: number; x:number; y:number } // shape, color, x & y holds the position sa board
    private nextPiece!: { shape: number[][]; color: number };
    private nextPieceDisplay!: Phaser.GameObjects.Graphics;
    private heldPiece: { shape: number[][]; color: number } | null = null;
    private canSwap: boolean = true;
    private heldPieceDisplay!: Phaser.GameObjects.Graphics;
    private controls = { left: 'LEFT', right: 'RIGHT', down: 'DOWN', up: 'UP', space: 'SPACE', a: 'A', d: 'D', s: 'S', w: 'W' };
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private dropTimer: Phaser.Time.TimerEvent | null = null;

    constructor() {
        super({ key: 'Game' });
    }

    preload(){

    }

    create() {

        // set background
        // const background = this.add.image(0, 0, 'GameBg').setOrigin(0);
        // background.setDisplaySize(this.scale.width, this.scale.height);

        this.initBoard = this.add.graphics();  
        this.renderBoard = this.add.graphics();
        
        this.initializeBoard(); 
        this.nextPieceDisplay = this.add.graphics();
        this.heldPieceDisplay = this.add.graphics();
        this.spawnTetromino();
        
        // Generate the first two tetrominoes (one active, one queued)
        this.currentPiece = getRandomTetromino();
        this.nextPiece = getRandomTetromino();
        
        this.rerenderBoard(); 
        this.updateNextPieceDisplay();
        this.display();
        this.speed();
    
        this.input.keyboard.on(`keydown-${this.controls.left}`, () => this.movePiece(-1));
        this.input.keyboard.on(`keydown-${this.controls.right}`, () => this.movePiece(1));
        this.input.keyboard.on(`keydown-${this.controls.down}`, () => this.dropPiece());
        this.input.keyboard.on(`keydown-${this.controls.up}`, () => this.rotatePiece());
        this.input.keyboard.on(`keydown-${this.controls.a}`, () => this.movePiece(-1));
        this.input.keyboard.on(`keydown-${this.controls.d}`, () => this.movePiece(1));
        this.input.keyboard.on(`keydown-${this.controls.s}`, () => this.dropPiece());
        this.input.keyboard.on(`keydown-${this.controls.w}`, () => this.rotatePiece());
        this.input.keyboard.on(`keydown-${this.controls.space}`, () => this.dropPieceImmediately());
        this.input.keyboard.on(`keydown-SHIFT`, () => this.swapHoldPiece());
    }
    
    //helper function para macenter ang board
    getBoardOffset() {
        const boardWidth = 10 * BLOCK_SIZE;
        const boardHeight = 20 * BLOCK_SIZE;
        return {
            x: (this.scale.width - boardWidth) / 2,
            y: (this.scale.height - boardHeight) / 2
        };
    }

    speed(){

        if (this.dropTimer) {
            this.dropTimer.remove(false);
        }

        let delay;
        if (this.score >= 2000) {
            delay = 100; 
        } else if (this.score >= 1500) {
            delay = 300; 
        } else if (this.score >= 1000) {
            delay = 500; 
        } else {
            delay = 1000; 
        }

        // Create a new timer with the calculated delay
        this.dropTimer = this.time.addEvent({
            delay: delay,
            callback: this.dropPiece,
            callbackScope: this,
            loop: true,
        });  
    }

    display() {
        this.scoreText = this.add.text(this.scale.width * 0.2, this.scale.height * 0.10, 'Score: 0', { fontFamily: 'Arial',  fontSize: '20px',  color: '#ffffff' }).setOrigin(0, 0.5); 
        this.add.text(this.scale.width * 0.65, this.scale.height * 0.37, 'Next Piece:', {fontFamily: 'Arial', fontSize: '20px', color: '#ffffff'}).setOrigin(0.5);
        this.add.text(this.scale.width * 0.65, this.scale.height * 0.10, 'Hold Piece:', {fontFamily: 'Arial', fontSize: '20px', color: '#ffffff'}).setOrigin(0.5);
        
        const controls = `
        Controls: 
        - Move Left: Left Arrow / A
        - Move Right: Right Arrow / D
        - Rotate: Up Arrow / W
        - Soft Drop: Down Arrow / S
        - Hard Drop: Space
        - Hold: Shift`
        this.add.text(this.scale.width * 0.68, this.scale.height * 0.70, controls, { fontFamily: 'Arial', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    }
    
    initializeBoard() {
        this.board = Array.from({ length: 20 }, () => new Array(10).fill(0)); // Create empty board
        
        const { x: offsetX, y: offsetY } = this.getBoardOffset();
    
        this.initBoard.clear();
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                const x = offsetX + col * BLOCK_SIZE;
                const y = offsetY + row * BLOCK_SIZE;
                this.initBoard.fillStyle(0x222222, 1);  // Dark color for empty cells
                this.initBoard.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
                this.initBoard.lineStyle(1, 0xffffff, 1);  // White border for the grid
                this.initBoard.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    rerenderBoard() {
        this.renderBoard.clear();
        for(let row = 0; row < 20; row++) {  // init row > cont loop as long as row is less than 20 > iterate every loop
            for (let col = 0; col < 10; col++) { // init col > cont loop as long as col less than 20 >
                if(this.board[row][col] !== 0) {
                    // calculate yung screen size para nasa gitna ang board
                    const x = (this.scale.width - 10 * BLOCK_SIZE) / 2 + col * BLOCK_SIZE;
                    const y = (this.scale.height - 20 * BLOCK_SIZE) / 2 + row * BLOCK_SIZE;
                    this.renderBoard.fillStyle(this.board[row][col], 1);
                    this.renderBoard.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
                    this.renderBoard.lineStyle(1, 0xffffff, 1); 
                    this.renderBoard.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
        this.drawTetromino();
    }

    spawnTetromino() {
        if (!this.nextPiece) { //make sure yung next piece ay naka define
            // console.warn("nextPiece was undefined. Generating a new one.");
            this.nextPiece = getRandomTetromino();
        }
    
        // Move nextPiece to currentPiece
        this.currentPiece = { ...this.nextPiece, x: Math.floor(this.board[0].length / 2) - Math.floor(this.nextPiece.shape[0].length / 2), y: 0 };
    
        // generate a new next piece
        this.nextPiece = getRandomTetromino();
    
        // console.log("After spawn - currentPiece:", this.currentPiece);
        // console.log("After spawn - nextPiece:", this.nextPiece);
    
        // Ensure the new currentPiece is valid
        if (!this.currentPiece || !this.currentPiece.shape) { 
            console.error("spawnTetromino failed: Invalid piece", this.currentPiece);
            return;
        }
    
        this.drawTetromino();
        this.updateNextPieceDisplay();  // update the next piece preview
    
        // Game Over Check: If the new piece immediately collides, game over
        if (this.validateMove(this.currentPiece, 0, 0)) { 
            // console.log("Game Over!");
            this.scene.start('GameOver', { score: this.score }); // Transition to the GameOver scene with the score
        }
    }
    
    updateNextPieceDisplay() {
        if (!this.nextPieceDisplay) {
            // console.warn("nextPieceDisplay is undefined. Initializing it now.");
            this.nextPieceDisplay = this.add.graphics(); 
        }
    
        this.nextPieceDisplay.clear(); // Now safe to use
    
        if (!this.nextPiece) return;

        const { shape, color } = this.nextPiece;
        const previewOffsetX = this.scale.width - 670;  
        const previewOffsetY = 330;  
        
        shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const xPos = previewOffsetX + colIndex * BLOCK_SIZE;
                    const yPos = previewOffsetY + rowIndex * BLOCK_SIZE;
    
                    this.nextPieceDisplay.fillStyle(color, 1);
                    this.nextPieceDisplay.fillRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);
                    this.nextPieceDisplay.lineStyle(1, 0xffffff, 1);
                    this.nextPieceDisplay.strokeRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }
    
    // renders the pieces on the board
    drawTetromino() {
        const { shape, color, x, y } = this.currentPiece; // create an ob then pasa yung characteristic ng shape
        const { x: offsetX, y: offsetY } = this.getBoardOffset();

        shape.forEach((row, rowIndex) => { //count tetromino's num row
            row.forEach((cell, colIndex) => { //count each col sa row 
                if (cell) { // check yung blocks (yung mga [1, 1], [1, 1) kapag wala zero, square ang shape
                    const xPos = offsetX + (x + colIndex) * BLOCK_SIZE; // offsetX + offsetY center ang board
                    const yPos = offsetY + (y + rowIndex) * BLOCK_SIZE; // x + colIndex at y + rowIndex, center tetromino sa board then convert yung grid sa block size

                    this.renderBoard.fillStyle(color, 1);
                    this.renderBoard.fillRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);

                    this.renderBoard.lineStyle(2, 0xffffff, 1);
                    this.renderBoard.strokeRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }

    movePiece(dx: number) {
        if (this.currentPiece && !this.validateMove(this.currentPiece, dx, 0)) { // -> !this.checkCollision meaning move is only allowed kapag walang collision
            this.currentPiece.x += dx; // move left or right
            this.rerenderBoard(); 
        }
    }

    dropPiece() {
        if (this.currentPiece && !this.validateMove(this.currentPiece, 0, 1)) {
            this.currentPiece.y += 1;  // Move the piece down by one row
            this.rerenderBoard(); // Redraw the board layout
        } else {
            // Lock the piece when it can't move down anymore
            this.lockTetromino();
            this.spawnTetromino();  // Spawn the next piece
        }
    }

    dropPieceImmediately() {
        let moved = false; // init as false kapag pinindot
        while (!this.validateMove(this.currentPiece, 0, 1)) { // kapag pinindot space bar, saka siya mag true
            this.currentPiece.y += 1;  
            moved = true;
        }

        if (moved) {
            this.lockTetromino(); // add piece sa board
            this.spawnTetromino();  // Spawn the next piece
            this.rerenderBoard(); 
        }
    }

    rotatePiece() {
        const newShape = this.rotateMatrix(this.currentPiece.shape); // holds yung rotated shape
        if (!this.validateMove({ ...this.currentPiece, shape: newShape }, 0, 0)) { //check if  kapag nirotate, magcacause ng collision
            this.currentPiece.shape = newShape; // if valid, apply ang rotation
            this.rerenderBoard(); // Redraw the board layout
        }
    }

    // ito ang naghahandle sa may rotation ng shape sa grid
    rotateMatrix(matrix: number[][]): number[][] {
        return matrix[0].map((_, index) => matrix.map(row => row[index])).reverse();
    }
                                          // col and row pos ng piece; dx: left/right; dy up/down
    validateMove(piece: { shape: number[][]; x: number; y: number }, dx: number, dy: number): boolean {
        const { shape, x, y } = piece;

        for (let row = 0; row < shape.length; row++) { // check each row ng tetromino
            for (let col = 0; col < shape[row].length; col++) { // check each column in that row
                if (shape[row][col]) { //  checks if there's a filled block (1) in that position

                    //calc position ng piece after moving
                    const newX = x + col + dx;
                    const newY = y + row + dy;
                    // newX < 0 check if it is hitting left wall 
                    // newX >- 0 check if it is hitting right wall 
                    // newY >= 20 bottom
                    // this.board[newY] && this.board[newY][newX] if nag cocollide sa lock pieces
                    if (newX < 0 || newX >= 10 || newY >= 20 || this.board[newY] && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Lock piece on the board
    lockTetromino() {
        const { shape, x, y, color } = this.currentPiece;
    
        shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const boardX = x + colIndex;
                    const boardY = y + rowIndex;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = color;
                    }
                }
            });
        });
    
        // Count cleared lines and update score
        const linesCleared = clearCompletedLines(this.board);
        this.board = linesCleared.newBoard;
        
        if (linesCleared.count > 0) {
            this.updateScore(linesCleared.count);
        }
    
        this.rerenderBoard();
        this.canSwap = true;
    }
    
    updateScore(lines: number) {
        const scoreTable = [0, 100, 300, 500, 800]; // Points per cleared lines
        this.score += scoreTable[lines] || 0;
        this.scoreText.setText(`Score: ${this.score}`);
        this.speed();
    }    

    swapHoldPiece() {
        if (!this.canSwap) return; // Prevent multiple swaps in one drop
    
        if (this.heldPiece === null) {
            this.heldPiece = { shape: this.currentPiece.shape, color: this.currentPiece.color };
            this.spawnTetromino(); // Get a new current piece
        } else {
            [this.currentPiece, this.heldPiece] = [
                { shape: this.heldPiece.shape, color: this.heldPiece.color, x: this.currentPiece.x, y: this.currentPiece.y },
                { shape: this.currentPiece.shape, color: this.currentPiece.color }
            ];
        }
    
        this.updateHeldPieceDisplay(); // Refresh display
        this.rerenderBoard(); // Redraw board after swapping
        this.canSwap = false; // Prevent multiple swaps per drop
    }
    
    updateHeldPieceDisplay() {
        this.heldPieceDisplay.clear(); // Clear previous rendering
    
        if (!this.heldPiece) return; // If there's no held piece, return
    
        const { shape, color } = this.heldPiece;
        const previewOffsetX = this.scale.width - 670; // Adjust positioning
        const previewOffsetY = 110; 
    
        // Draw the held piece
        shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const xPos = previewOffsetX + colIndex * BLOCK_SIZE;
                    const yPos = previewOffsetY + rowIndex * BLOCK_SIZE;
    
                    this.heldPieceDisplay.fillStyle(color, 1);
                    this.heldPieceDisplay.fillRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);
                    this.heldPieceDisplay.lineStyle(1, 0xffffff, 1);
                    this.heldPieceDisplay.strokeRect(xPos, yPos, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }   
}

export default Game;
