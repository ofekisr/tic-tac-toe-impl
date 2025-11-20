import { Injectable } from '@nestjs/common';
import { Board, Move, PlayerSymbol, ErrorCode } from '@fusion-tic-tac-toe/shared';
import { Game } from '../../domain/entities/Game';
import { ValidationResult } from '../../domain/value-objects/ValidationResult';

/**
 * MoveValidationService validates moves before they are processed.
 * 
 * Validates:
 * - Game exists and is in 'playing' status
 * - It's the requesting player's turn
 * - Cell is empty (not occupied)
 * - Position is valid (0-2 range)
 * - Game is not finished
 */
@Injectable()
export class MoveValidationService {
  /**
   * Validates a move request.
   * 
   * @param game - The game entity
   * @param move - The move to validate
   * @param playerSymbol - The player making the move
   * @returns ValidationResult indicating success or specific error
   */
  validateMove(
    game: Game,
    move: Move,
    playerSymbol: PlayerSymbol,
  ): ValidationResult {
    // Check game status
    const statusResult = this.validateGameStatus(game);
    if (!statusResult.isValid) {
      return statusResult;
    }

    // Check turn
    const turnResult = this.validateTurn(game, playerSymbol);
    if (!turnResult.isValid) {
      return turnResult;
    }

    // Check position (already validated by Move constructor, but double-check)
    const positionResult = this.validatePosition(move);
    if (!positionResult.isValid) {
      return positionResult;
    }

    // Check cell availability
    const cellResult = this.validateCell(game, move);
    if (!cellResult.isValid) {
      return cellResult;
    }

    return { isValid: true };
  }

  /**
   * Validates that the game is in 'playing' status and not finished.
   */
  private validateGameStatus(game: Game): ValidationResult {
    if (game.status === 'finished') {
      return {
        isValid: false,
        errorCode: ErrorCode.GAME_ALREADY_FINISHED,
        message: 'Game has already finished',
      };
    }

    if (game.status !== 'playing') {
      return {
        isValid: false,
        errorCode: ErrorCode.INVALID_MOVE,
        message: `Game is not in playing status. Current status: ${game.status}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validates that it's the requesting player's turn.
   */
  private validateTurn(game: Game, playerSymbol: PlayerSymbol): ValidationResult {
    if (game.currentPlayer !== playerSymbol) {
      return {
        isValid: false,
        errorCode: ErrorCode.NOT_YOUR_TURN,
        message: `It's not your turn. Current player: ${game.currentPlayer}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validates that the move position is within bounds.
   * Note: Move constructor already validates, but this provides explicit error code.
   */
  private validatePosition(move: Move): ValidationResult {
    if (move.row < 0 || move.row >= 3 || move.col < 0 || move.col >= 3) {
      return {
        isValid: false,
        errorCode: ErrorCode.INVALID_POSITION,
        message: `Position must be between 0 and 2. Got row: ${move.row}, col: ${move.col}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validates that the target cell is empty.
   */
  private validateCell(game: Game, move: Move): ValidationResult {
    if (!game.board.isEmpty(move.row, move.col)) {
      return {
        isValid: false,
        errorCode: ErrorCode.CELL_OCCUPIED,
        message: `Cell at position (${move.row}, ${move.col}) is already occupied`,
      };
    }

    return { isValid: true };
  }
}

