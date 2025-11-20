import { Injectable } from '@nestjs/common';
import { Move, PlayerSymbol, GameState, Board } from '@fusion-tic-tac-toe/shared';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { Game } from '../../domain/entities/Game';
import { MoveValidationService } from './MoveValidationService';
import { GameSyncService } from './GameSyncService';
import { ValidationResult } from '../../domain/value-objects/ValidationResult';

/**
 * GameStateService handles game state management including move processing,
 * turn alternation, and board updates.
 */
@Injectable()
export class GameStateService {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly moveValidationService: MoveValidationService,
    private readonly gameSyncService: GameSyncService,
  ) {}

  /**
   * Processes a move request.
   * 
   * @param gameCode - The game code
   * @param move - The move to process
   * @param playerSymbol - The player making the move
   * @returns Updated game state
   * @throws Error if game not found or move is invalid
   */
  async makeMove(
    gameCode: string,
    move: Move,
    playerSymbol: PlayerSymbol,
  ): Promise<GameState> {
    // Load game from repository
    const gameState = await this.gameRepository.findByCode(gameCode);
    if (!gameState) {
      throw new Error(`Game not found: ${gameCode}`);
    }

    // Convert to domain entity
    const game = Game.fromDTO(gameState);

    // Validate move
    const validationResult = this.moveValidationService.validateMove(
      game,
      move,
      playerSymbol,
    );

    if (!validationResult.isValid) {
      throw new Error(
        validationResult.message || `Invalid move: ${validationResult.errorCode}`,
      );
    }

    // Update board
    const updatedGame = this.updateBoard(game, move);

    // Check for win
    const winner = this.checkWinCondition(updatedGame.board);
    const isDraw = this.checkDrawCondition(updatedGame.board, winner);

    // Determine final status and winner
    let finalStatus = updatedGame.status;
    let finalWinner = updatedGame.winner;

    if (winner) {
      finalStatus = 'finished';
      finalWinner = winner;
    } else if (isDraw) {
      finalStatus = 'finished';
      finalWinner = null;
    }

    // Alternate turn (only if game not finished)
    const gameWithAlternatedTurn =
      finalStatus === 'finished'
        ? updatedGame
        : this.alternateTurn(updatedGame);

    // Update timestamp
    const finalGame = new Game(
      gameWithAlternatedTurn.gameCode,
      gameWithAlternatedTurn.board,
      gameWithAlternatedTurn.currentPlayer,
      finalStatus,
      finalWinner,
      gameWithAlternatedTurn.players,
      gameWithAlternatedTurn.createdAt,
      new Date(), // updatedAt
    );

    // Save to repository
    const updatedGameState = finalGame.toDTO();
    await this.gameRepository.update(updatedGameState);

    // Publish sync message for cross-server synchronization
    const syncEvent = finalStatus === 'finished' 
      ? (finalWinner ? 'win' : 'draw')
      : 'move';
    await this.gameSyncService.publishGameUpdate(gameCode, syncEvent, updatedGameState);

    return updatedGameState;
  }

  /**
   * Updates the board with a move.
   */
  private updateBoard(game: Game, move: Move): Game {
    // Create a new board from the current board's array
    const boardArray = game.board.toArray();
    boardArray[move.row][move.col] = move.player;
    const newBoard = Board.fromArray(boardArray);

    return new Game(
      game.gameCode,
      newBoard,
      game.currentPlayer,
      game.status,
      game.winner,
      game.players,
      game.createdAt,
      game.updatedAt,
    );
  }

  /**
   * Alternates the turn between players.
   */
  private alternateTurn(game: Game): Game {
    const nextPlayer: PlayerSymbol = game.currentPlayer === 'X' ? 'O' : 'X';

    return new Game(
      game.gameCode,
      game.board,
      nextPlayer,
      game.status,
      game.winner,
      game.players,
      game.createdAt,
      game.updatedAt,
    );
  }

  /**
   * Checks if a player has won (three in a row).
   * 
   * @param board - The game board
   * @returns Winning player symbol or null if no winner
   */
  checkWinCondition(board: Board): PlayerSymbol | null {
    // Check rows
    for (let row = 0; row < 3; row++) {
      const winner = this.checkRow(board, row);
      if (winner) {
        return winner;
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      const winner = this.checkColumn(board, col);
      if (winner) {
        return winner;
      }
    }

    // Check diagonals
    const diagonalWinner = this.checkDiagonals(board);
    if (diagonalWinner) {
      return diagonalWinner;
    }

    return null;
  }

  /**
   * Checks if a row has three of the same symbol.
   */
  private checkRow(board: Board, row: number): PlayerSymbol | null {
    const cell0 = board.getCell(row, 0);
    const cell1 = board.getCell(row, 1);
    const cell2 = board.getCell(row, 2);

    if (cell0 !== '' && cell0 === cell1 && cell1 === cell2) {
      return cell0 as PlayerSymbol;
    }

    return null;
  }

  /**
   * Checks if a column has three of the same symbol.
   */
  private checkColumn(board: Board, col: number): PlayerSymbol | null {
    const cell0 = board.getCell(0, col);
    const cell1 = board.getCell(1, col);
    const cell2 = board.getCell(2, col);

    if (cell0 !== '' && cell0 === cell1 && cell1 === cell2) {
      return cell0 as PlayerSymbol;
    }

    return null;
  }

  /**
   * Checks if either diagonal has three of the same symbol.
   */
  private checkDiagonals(board: Board): PlayerSymbol | null {
    // Main diagonal (0,0 → 2,2)
    const main0 = board.getCell(0, 0);
    const main1 = board.getCell(1, 1);
    const main2 = board.getCell(2, 2);

    if (main0 !== '' && main0 === main1 && main1 === main2) {
      return main0 as PlayerSymbol;
    }

    // Anti-diagonal (0,2 → 2,0)
    const anti0 = board.getCell(0, 2);
    const anti1 = board.getCell(1, 1);
    const anti2 = board.getCell(2, 0);

    if (anti0 !== '' && anti0 === anti1 && anti1 === anti2) {
      return anti0 as PlayerSymbol;
    }

    return null;
  }

  /**
   * Checks if the game is a draw (board full, no winner).
   * 
   * @param board - The game board
   * @param winner - The winner from win check (null if no winner)
   * @returns true if draw, false otherwise
   */
  checkDrawCondition(board: Board, winner: PlayerSymbol | null): boolean {
    return winner === null && board.isFull();
  }
}

