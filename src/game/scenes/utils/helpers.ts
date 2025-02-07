import { BLOCKS, COLORS } from './pieces';

export function getRandomTetromino() {
    const keys = Object.keys(BLOCKS) as Array<keyof typeof BLOCKS>; 
    const randomKey = keys[Math.floor(Math.random() * keys.length)]; // Pick a random shape
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)]; // Pick a random color

    return {
        shape: BLOCKS[randomKey], 
        color: randomColor,
        x: Math.floor(10 / 2) - 1,
        y: 0
    };
}

export function clearCompletedLines(board: number[][]): number[][] {
    for (let row = 19; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            // Shift all rows above the current row down by one
            for (let r = row; r > 0; r--) {
                board[r] = [...board[r - 1]]; // Copy the row above down
            }
            // Clear the top row after shifting
            board[0] = new Array(10).fill(0);

            // After clearing a line, don't check this row again, shift down the current row index
            row++;
        }
    }
    return board;
}