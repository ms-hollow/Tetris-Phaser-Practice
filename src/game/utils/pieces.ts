export const BLOCK_SIZE = 30;

export const BLOCKS = {
    I: [[1, 1, 1, 1]], // Straight line
    O: [[1, 1], [1, 1]], // Square
    T: [[0, 1, 0], [1, 1, 1]], // T-shape
    S: [[0, 1, 1], [1, 1, 0]], // S-shape
    Z: [[1, 1, 0], [0, 1, 1]], // Z-shape
    J: [[1, 0, 0], [1, 1, 1]], // J-shape
    L: [[0, 0, 1], [1, 1, 1]] // L-shape
};

export const COLORS = [
    0x1E90FF, // Dodger Blue
    0xFFD700, // Gold
    0x8A2BE2, // Blue Violet
    0xFF1493, // Deep Pink 
    0x32CD32, // Green
    0xFF4500, // Orange Red
    0xA52A2A  // Brown 
];
