"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Move = exports.BoardMapper = exports.Board = exports.EMPTY_CELL = exports.BOARD_SIZE = void 0;
// Constants
exports.BOARD_SIZE = 3;
exports.EMPTY_CELL = '';
// Board Class (Value Object)
class Board {
    cells;
    constructor(cells) {
        if (cells) {
            this.validateBoard(cells);
            this.cells = cells;
        }
        else {
            // Create empty 3x3 board
            this.cells = [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ];
        }
    }
    getCell(row, col) {
        this.validatePosition(row, col);
        return this.cells[row][col];
    }
    setCell(row, col, value) {
        this.validatePosition(row, col);
        this.cells[row][col] = value;
    }
    isEmpty(row, col) {
        return this.getCell(row, col) === '';
    }
    isFull() {
        return this.cells.every(row => row.every(cell => cell !== ''));
    }
    toArray() {
        // Return deep copy to prevent external mutation
        return this.cells.map(row => [...row]);
    }
    static fromArray(cells) {
        return new Board(cells);
    }
    validateBoard(cells) {
        if (cells.length !== exports.BOARD_SIZE) {
            throw new Error(`Board must be ${exports.BOARD_SIZE}x${exports.BOARD_SIZE}`);
        }
        for (const row of cells) {
            if (row.length !== exports.BOARD_SIZE) {
                throw new Error(`Board must be ${exports.BOARD_SIZE}x${exports.BOARD_SIZE}`);
            }
        }
    }
    validatePosition(row, col) {
        if (row < 0 || row >= exports.BOARD_SIZE || col < 0 || col >= exports.BOARD_SIZE) {
            throw new Error(`Position must be between 0 and ${exports.BOARD_SIZE - 1}`);
        }
    }
}
exports.Board = Board;
// Mapper for conversion between Board (domain) and BoardDTO (transfer)
class BoardMapper {
    static toDTO(board) {
        return board.toArray();
    }
    static fromDTO(dto) {
        return Board.fromArray(dto);
    }
}
exports.BoardMapper = BoardMapper;
// Move Class
class Move {
    row;
    col;
    player;
    timestamp;
    constructor(row, col, player, timestamp = new Date()) {
        this.row = row;
        this.col = col;
        this.player = player;
        this.timestamp = timestamp;
        this.validate();
    }
    toPosition() {
        return { row: this.row, col: this.col };
    }
    equals(other) {
        return (this.row === other.row &&
            this.col === other.col &&
            this.player === other.player);
    }
    validate() {
        if (this.row < 0 || this.row >= exports.BOARD_SIZE || this.col < 0 || this.col >= exports.BOARD_SIZE) {
            throw new Error(`Position must be between 0 and ${exports.BOARD_SIZE - 1}`);
        }
        if (this.player !== 'X' && this.player !== 'O') {
            throw new Error("Player must be 'X' or 'O'");
        }
    }
}
exports.Move = Move;
//# sourceMappingURL=game.js.map