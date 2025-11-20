// Import types needed for message definitions
import type { BoardDTO, PlayerSymbol, GameStatus } from './game';
import type { ErrorCode } from './errors';

// Client → Server Messages
export interface JoinGameMessage {
  type: 'join';
  gameCode: string;
}

export interface MakeMoveMessage {
  type: 'move';
  gameCode: string;
  row: number; // 0-2
  col: number; // 0-2
}

export type ClientMessage = JoinGameMessage | MakeMoveMessage;

// Server → Client Messages
export interface JoinedMessage {
  type: 'joined';
  gameCode: string;
  board: BoardDTO; // BoardDTO (BoardCell[][]) for JSON serialization
  currentPlayer: PlayerSymbol;
  status: GameStatus;
  playerSymbol: PlayerSymbol; // Which symbol this client is
}

export interface UpdateMessage {
  type: 'update';
  gameCode: string;
  board: BoardDTO; // BoardDTO (BoardCell[][]) for JSON serialization
  currentPlayer: PlayerSymbol;
  status: 'playing';
}

export interface WinMessage {
  type: 'win';
  gameCode: string;
  board: BoardDTO; // BoardDTO (BoardCell[][]) for JSON serialization
  winner: PlayerSymbol;
}

export interface DrawMessage {
  type: 'draw';
  gameCode: string;
  board: BoardDTO; // BoardDTO (BoardCell[][]) for JSON serialization
}

export interface ErrorMessage {
  type: 'error';
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export type ServerMessage = JoinedMessage | UpdateMessage | WinMessage | DrawMessage | ErrorMessage;

// Type guards
export function isClientMessage(msg: unknown): msg is ClientMessage {
  if (typeof msg !== 'object' || msg === null) {
    return false;
  }
  
  if (!('type' in msg)) {
    return false;
  }
  
  const type = (msg as { type: unknown }).type;
  
  if (type === 'join') {
    return 'gameCode' in msg && typeof (msg as { gameCode: unknown }).gameCode === 'string';
  }
  
  if (type === 'move') {
    const moveMsg = msg as { gameCode?: unknown; row?: unknown; col?: unknown };
    return (
      typeof moveMsg.gameCode === 'string' &&
      typeof moveMsg.row === 'number' &&
      typeof moveMsg.col === 'number'
    );
  }
  
  return false;
}

export function isServerMessage(msg: unknown): msg is ServerMessage {
  if (typeof msg !== 'object' || msg === null) {
    return false;
  }
  
  if (!('type' in msg)) {
    return false;
  }
  
  const type = (msg as { type: unknown }).type;
  const validTypes = ['joined', 'update', 'win', 'draw', 'error'];
  
  return typeof type === 'string' && validTypes.includes(type);
}

