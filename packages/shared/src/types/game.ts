// Constants
export const BOARD_SIZE = 3;
export const EMPTY_CELL = '' as const;

// Types
export type BoardCell = '' | 'X' | 'O';
export type PlayerSymbol = 'X' | 'O';
export type GameStatus = 'waiting' | 'playing' | 'finished';

// Board Position
export interface BoardPosition {
  row: number;
  col: number;
}

// Board Class (Value Object)
export class Board {
  private readonly cells: BoardCell[][];

  constructor(cells?: BoardCell[][]) {
    if (cells) {
      this.validateBoard(cells);
      this.cells = cells;
    } else {
      // Create empty 3x3 board
      this.cells = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ];
    }
  }

  getCell(row: number, col: number): BoardCell {
    this.validatePosition(row, col);
    return this.cells[row][col];
  }

  setCell(row: number, col: number, value: BoardCell): void {
    this.validatePosition(row, col);
    this.cells[row][col] = value;
  }

  isEmpty(row: number, col: number): boolean {
    return this.getCell(row, col) === '';
  }

  isFull(): boolean {
    return this.cells.every(row => row.every(cell => cell !== ''));
  }

  toArray(): BoardCell[][] {
    // Return deep copy to prevent external mutation
    return this.cells.map(row => [...row]);
  }

  static fromArray(cells: BoardCell[][]): Board {
    return new Board(cells);
  }

  private validateBoard(cells: BoardCell[][]): void {
    if (cells.length !== BOARD_SIZE) {
      throw new Error(`Board must be ${BOARD_SIZE}x${BOARD_SIZE}`);
    }
    for (const row of cells) {
      if (row.length !== BOARD_SIZE) {
        throw new Error(`Board must be ${BOARD_SIZE}x${BOARD_SIZE}`);
      }
    }
  }

  private validatePosition(row: number, col: number): void {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      throw new Error(`Position must be between 0 and ${BOARD_SIZE - 1}`);
    }
  }
}

// DTO for data transfer (WebSocket, Redis)
export type BoardDTO = BoardCell[][];

// Mapper for conversion between Board (domain) and BoardDTO (transfer)
export class BoardMapper {
  static toDTO(board: Board): BoardDTO {
    return board.toArray();
  }

  static fromDTO(dto: BoardDTO): Board {
    return Board.fromArray(dto);
  }
}

// Move Class
export class Move {
  constructor(
    public readonly row: number,
    public readonly col: number,
    public readonly player: PlayerSymbol,
    public readonly timestamp: Date = new Date()
  ) {
    this.validate();
  }

  toPosition(): BoardPosition {
    return { row: this.row, col: this.col };
  }

  equals(other: Move): boolean {
    return (
      this.row === other.row &&
      this.col === other.col &&
      this.player === other.player
    );
  }

  private validate(): void {
    if (this.row < 0 || this.row >= BOARD_SIZE || this.col < 0 || this.col >= BOARD_SIZE) {
      throw new Error(`Position must be between 0 and ${BOARD_SIZE - 1}`);
    }
    if (this.player !== 'X' && this.player !== 'O') {
      throw new Error("Player must be 'X' or 'O'");
    }
  }
}

// Game State Interface
export interface GameState {
  gameCode: string;
  board: Board;
  currentPlayer: PlayerSymbol;
  status: GameStatus;
  winner?: PlayerSymbol;
  players: {
    X?: string; // Player ID or connection ID
    O?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

