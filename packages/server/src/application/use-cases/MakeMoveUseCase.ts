import { Injectable, Logger, Inject } from '@nestjs/common';
import { GameState, Move, PlayerSymbol } from '@fusion-tic-tac-toe/shared';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { GameStateService } from '../services/GameStateService';
import { ConnectionManager } from '../services/ConnectionManager';
import { GameSyncService } from '../services/GameSyncService';

/**
 * Use case for processing a move in a game.
 * 
 * When a client sends { type: 'move', gameCode: 'ABC123', row: 1, col: 1 }, this use case:
 * 1. Validates the move using MoveValidationService (via GameStateService)
 * 2. Updates the game state (board, currentPlayer, status, winner)
 * 3. Saves updated state to Redis
 * 4. Publishes sync message for cross-server synchronization
 * 5. Returns updated GameState
 */
@Injectable()
export class MakeMoveUseCase {
  private readonly logger = new Logger(MakeMoveUseCase.name);

  constructor(
    @Inject('IGameRepository')
    private readonly gameRepository: IGameRepository,
    private readonly gameStateService: GameStateService,
    private readonly connectionManager: ConnectionManager,
    private readonly gameSyncService: GameSyncService,
  ) {}

  /**
   * Execute move processing.
   * @param gameCode - Game code
   * @param move - Move to process
   * @param playerSymbol - Player making the move
   * @returns Promise that resolves to updated GameState
   * @throws Error if game not found or move is invalid
   */
  async execute(
    gameCode: string,
    move: Move,
    playerSymbol: PlayerSymbol,
  ): Promise<GameState> {
    this.logger.log(
      `Processing move: gameCode=${gameCode}, player=${playerSymbol}, row=${move.row}, col=${move.col}`,
    );

    // Process move using GameStateService (which handles validation, board update, win/draw detection, turn alternation)
    const updatedGameState = await this.gameStateService.makeMove(
      gameCode,
      move,
      playerSymbol,
    );

    this.logger.log(
      `Move processed successfully: gameCode=${gameCode}, status=${updatedGameState.status}, currentPlayer=${updatedGameState.currentPlayer}`,
    );

    return updatedGameState;
  }
}

