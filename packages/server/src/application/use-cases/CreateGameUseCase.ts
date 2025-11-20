import { Injectable, Logger, Inject } from '@nestjs/common';
import { GameState, Board } from '@fusion-tic-tac-toe/shared';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { GameService } from '../services/GameService';
import { ConnectionManager } from '../services/ConnectionManager';
import { GameSyncService } from '../services/GameSyncService';
import { Game } from '../../domain/entities/Game';

/**
 * Use case for creating a new game session.
 * 
 * When a client sends { type: 'join', gameCode: 'NEW' }, this use case:
 * 1. Generates a unique game code
 * 2. Creates game state with empty 3x3 board, status 'waiting', currentPlayer 'X'
 * 3. Stores game state in Redis with TTL (3600 seconds)
 * 4. Assigns player 'X' to the creating client
 * 5. Returns GameState DTO with game code and initial state
 */
@Injectable()
export class CreateGameUseCase {
  private readonly logger = new Logger(CreateGameUseCase.name);
  private static readonly GAME_TTL_SECONDS = 3600; // 1 hour

  constructor(
    @Inject('IGameRepository')
    private readonly gameRepository: IGameRepository,
    private readonly gameService: GameService,
    private readonly connectionManager: ConnectionManager,
    private readonly gameSyncService: GameSyncService,
  ) {}

  /**
   * Execute game creation.
   * @param connectionId - Connection ID of the client creating the game
   * @returns Promise that resolves to GameState DTO with game code and initial state
   */
  async execute(connectionId: string): Promise<GameState> {
    this.logger.log(`Creating new game for connection: ${connectionId}`);

    // Generate unique game code
    const gameCode = await this.gameService.generateUniqueGameCode();
    this.logger.log(`Generated game code: ${gameCode}`);

    // Create Game entity with initial state
    const game = new Game(
      gameCode,
      new Board(), // Empty 3x3 board
      'X', // Current player starts as 'X'
      'waiting', // Status is 'waiting' until second player joins
      null, // No winner initially
      { X: connectionId }, // Assign player 'X' to creating client
    );

    // Convert to GameState for repository
    const gameState = game.toDTO();

    // Store game state in Redis with TTL
    await this.gameRepository.create(
      gameState,
      CreateGameUseCase.GAME_TTL_SECONDS,
    );
    this.logger.log(
      `Game state stored in Redis: gameCode=${gameCode}, ttl=${CreateGameUseCase.GAME_TTL_SECONDS}s`,
    );

    // Register connection with ConnectionManager
    this.connectionManager.registerConnection(connectionId, gameCode, 'X');
    this.logger.log(
      `Connection registered: connectionId=${connectionId}, gameCode=${gameCode}, playerSymbol=X`,
    );

    // Publish sync message for cross-server synchronization
    await this.gameSyncService.publishGameUpdate(gameCode, 'join', gameState);

    this.logger.log(`Game created successfully: gameCode=${gameCode}`);
    return gameState;
  }
}

