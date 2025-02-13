import { BLOCKS, COLORS } from './pieces';

let tetrominoBag: Array<keyof typeof BLOCKS> = [];
let lastColor: number = -1;

function shuffleArray(array: any[]) {  
    // Loop through the array from the last element to the second element  
    for (let i = array.length - 1; i > 0; i--) {  
        // Pick a random index from 0 to i (inclusive)  
        const j = Math.floor(Math.random() * (i + 1));  
        
        // Swap the elements at index i and index j  
        [array[i], array[j]] = [array[j], array[i]];  
    }  
    
    // Return the shuffled array  
    return array;  
}


export function getRandomTetromino() {
    // Check if the bag is empty and refill it
    if (tetrominoBag.length === 0) {
        tetrominoBag = shuffleArray(Object.keys(BLOCKS) as Array<keyof typeof BLOCKS>); // Get Tetromino types, cast them, shuffle the order, and store in tetrominoBag
    }

    // Take one tetromino from the bag
    const randomKey = tetrominoBag.pop();
    if (!randomKey) {
        console.error("Error: tetrominoBag is empty, randomKey is undefined.");
        return getRandomTetromino(); // Try again
    }

    let randomColor;
    do {
        randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (randomColor === lastColor); // Avoid repeating color

    lastColor = randomColor;

    return {
        shape: BLOCKS[randomKey], 
        color: randomColor,
        x: Math.floor(10 / 2) - 1,
        y: 0
    };
}

export function clearCompletedLines(board: number[][]): { newBoard: number[][], count: number } {
    // Filter out rows that are completely filled (i.e., no cells with value 0)
    let newBoard = board.filter(row => row.some(cell => cell === 0));
    
    // Calculate the number of lines that were cleared
    let clearedLines = 20 - newBoard.length;

    // Add empty rows at the top of the board to maintain the board height of 20 rows
    while (newBoard.length < 20) {
        newBoard.unshift(new Array(10).fill(0));
    }

    // Return the new board and the count of cleared lines
    return { newBoard, count: clearedLines };
}