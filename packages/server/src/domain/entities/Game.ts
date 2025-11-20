import { Board, BoardDTO, BoardMapper, GameState, PlayerSymbol, GameStatus } from '@fusion-tic-tac-toe/shared';

/**
 * Game entity representing a Tic-Tac-Toe game session.
 * 
 * This entity encapsulates the game state including:
 * - Game code for identification
 * - Board state (3x3 grid)
 * - Current player turn
 * - Game status (waiting, playing, finished)
 * - Winner (if game is finished)
 * - Player assignments (connection IDs)
 * - Timestamps
 */
export class Game {
  public readonly gameCode: string;
  public readonly board: Board;
  public readonly currentPlayer: PlayerSymbol;
  public readonly status: GameStatus;
  public readonly winner: PlayerSymbol | null;
  public readonly players: {
    X?: string;
    O?: string;
  };
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(
    gameCode: string,
    board?: Board,
    currentPlayer: PlayerSymbol = 'X',
    status: GameStatus = 'waiting',
    winner: PlayerSymbol | null = null,
    players: { X?: string; O?: string } = {},
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.gameCode = gameCode;
    this.board = board || new Board(); // Initialize empty 3x3 board if not provided
    this.currentPlayer = currentPlayer;
    this.status = status;
    this.winner = winner;
    this.players = { ...players };
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Converts the Game entity to a GameState DTO.
   * Used for serialization and data transfer.
   * 
   * @returns GameState DTO
   */
  toDTO(): GameState {
    return {
      gameCode: this.gameCode,
      board: this.board,
      currentPlayer: this.currentPlayer,
      status: this.status,
      winner: this.winner || undefined,
      players: {
        X: this.players.X,
        O: this.players.O,
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Creates a Game entity from a GameState DTO.
   * 
   * @param gameState - GameState DTO
   * @returns Game entity
   */
  static fromDTO(gameState: GameState): Game {
    return new Game(
      gameState.gameCode,
      gameState.board,
      gameState.currentPlayer,
      gameState.status,
      gameState.winner || null,
      gameState.players,
      gameState.createdAt,
      gameState.updatedAt,
    );
  }
}

