export declare const BOARD_SIZE = 3;
export declare const EMPTY_CELL: "";
export type BoardCell = '' | 'X' | 'O';
export type PlayerSymbol = 'X' | 'O';
export type GameStatus = 'waiting' | 'playing' | 'finished';
export interface BoardPosition {
    row: number;
    col: number;
}
export declare class Board {
    private readonly cells;
    constructor(cells?: BoardCell[][]);
    getCell(row: number, col: number): BoardCell;
    setCell(row: number, col: number, value: BoardCell): void;
    isEmpty(row: number, col: number): boolean;
    isFull(): boolean;
    toArray(): BoardCell[][];
    static fromArray(cells: BoardCell[][]): Board;
    private validateBoard;
    private validatePosition;
}
export type BoardDTO = BoardCell[][];
export declare class BoardMapper {
    static toDTO(board: Board): BoardDTO;
    static fromDTO(dto: BoardDTO): Board;
}
export declare class Move {
    readonly row: number;
    readonly col: number;
    readonly player: PlayerSymbol;
    readonly timestamp: Date;
    constructor(row: number, col: number, player: PlayerSymbol, timestamp?: Date);
    toPosition(): BoardPosition;
    equals(other: Move): boolean;
    private validate;
}
export interface GameState {
    gameCode: string;
    board: Board;
    currentPlayer: PlayerSymbol;
    status: GameStatus;
    winner?: PlayerSymbol;
    players: {
        X?: string;
        O?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=game.d.ts.map