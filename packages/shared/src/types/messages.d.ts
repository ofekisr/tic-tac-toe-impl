import type { BoardDTO, PlayerSymbol, GameStatus } from './game';
import type { ErrorCode } from './errors';
export interface JoinGameMessage {
    type: 'join';
    gameCode: string;
}
export interface MakeMoveMessage {
    type: 'move';
    gameCode: string;
    row: number;
    col: number;
}
export type ClientMessage = JoinGameMessage | MakeMoveMessage;
export interface JoinedMessage {
    type: 'joined';
    gameCode: string;
    board: BoardDTO;
    currentPlayer: PlayerSymbol;
    status: GameStatus;
    playerSymbol: PlayerSymbol;
}
export interface UpdateMessage {
    type: 'update';
    gameCode: string;
    board: BoardDTO;
    currentPlayer: PlayerSymbol;
    status: 'playing';
}
export interface WinMessage {
    type: 'win';
    gameCode: string;
    board: BoardDTO;
    winner: PlayerSymbol;
}
export interface DrawMessage {
    type: 'draw';
    gameCode: string;
    board: BoardDTO;
}
export interface ErrorMessage {
    type: 'error';
    code: ErrorCode;
    message: string;
    details?: unknown;
}
export type ServerMessage = JoinedMessage | UpdateMessage | WinMessage | DrawMessage | ErrorMessage;
export declare function isClientMessage(msg: unknown): msg is ClientMessage;
export declare function isServerMessage(msg: unknown): msg is ServerMessage;
//# sourceMappingURL=messages.d.ts.map