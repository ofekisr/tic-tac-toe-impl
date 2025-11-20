import { Injectable, Logger, Inject } from '@nestjs/common';
import { GameState, ErrorCode } from '@fusion-tic-tac-toe/shared';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { ConnectionManager } from '../services/ConnectionManager';
import { GameNotFoundException } from '../../domain/exceptions/GameNotFoundException';
import { ErrorResponseBuilder } from '../utils/ErrorResponseBuilder';

/**
 * Result of joining a game.
 */
export interface JoinedGameResult {
  gameState: GameState;
  playerSymbol: 'O';
}

/**
 * Use case for joining an existing game.
 * 
 * When a client sends { type: 'join', gameCode: 'ABC123' }, this use case:
 * 1. Validates game exists
 * 2. Validates game status is 'waiting'
 * 3. Validates game has space (only one player)
 * 4. Assigns player 'O' to joining client
 * 5. Updates game state to 'playing'
 * 6. Returns game state and player symbol
 */
@Injectable()
export class JoinGameUseCase {
  private readonly logger = new Logger(JoinGameUseCase.name);

  constructor(
    @Inject('IGameRepository')
    private readonly gameRepository: IGameRepository,
    private readonly connectionManager: ConnectionManager,
  ) {}

  /**
   * Execute game joining.
   * @param gameCode - Game code to join
   * @param connectionId - Connection ID of the client joining the game
   * @returns Promise that resolves to JoinedGameResult with game state and player symbol
   * @throws GameNotFoundException if game does not exist
   * @throws Error if game is not in waiting status or is full
   */
  async execute(
    gameCode: string,
    connectionId: string,
  ): Promise<JoinedGameResult> {
    this.logger.log(
      `Joining game: gameCode=${gameCode}, connectionId=${connectionId}`,
    );

    // Load game from repository
    const game = await this.gameRepository.findByCode(gameCode);

    if (!game) {
      this.logger.warn(`Game not found: gameCode=${gameCode}`);
      throw new GameNotFoundException(gameCode);
    }

    // Validate game status is 'waiting'
    if (game.status !== 'waiting') {
      this.logger.warn(
        `Cannot join game: gameCode=${gameCode}, status=${game.status}`,
      );
      throw new Error(
        `Game is not in waiting status. Current status: ${game.status}`,
      );
    }

    // Validate game has space (only one player currently)
    const playerCount = [game.players.X, game.players.O].filter(
      (p) => p !== undefined,
    ).length;

    if (playerCount >= 2) {
      this.logger.warn(
        `Game is full: gameCode=${gameCode}, players=${JSON.stringify(game.players)}`,
      );
      throw new Error('Game already has two players');
    }

    // Get the first player's connection ID (should be X)
    const firstPlayerConnectionId = game.players.X;
    if (!firstPlayerConnectionId) {
      this.logger.error(
        `Invalid game state: gameCode=${gameCode}, no player X found`,
      );
      throw new Error('Invalid game state: first player not found');
    }

    // Update game state
    const updatedGame: GameState = {
      ...game,
      status: 'playing',
      currentPlayer: 'X', // First player's turn
      players: {
        X: firstPlayerConnectionId,
        O: connectionId, // Assign player O to joining client
      },
      updatedAt: new Date(),
    };

    // Save updated game state
    await this.gameRepository.update(updatedGame);
    this.logger.log(
      `Game state updated: gameCode=${gameCode}, status=playing, players=${JSON.stringify(updatedGame.players)}`,
    );

    // Register connection with ConnectionManager
    this.connectionManager.registerConnection(connectionId, gameCode, 'O');
    this.logger.log(
      `Connection registered: connectionId=${connectionId}, gameCode=${gameCode}, playerSymbol=O`,
    );

    this.logger.log(`Game joined successfully: gameCode=${gameCode}`);
    return {
      gameState: updatedGame,
      playerSymbol: 'O',
    };
  }
}

