import { Injectable, Logger, Inject } from '@nestjs/common';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { ConnectionManager } from '../services/ConnectionManager';

/**
 * Use case for updating game state when a player disconnects.
 * Removes the disconnected player from the game's players object.
 */
@Injectable()
export class UpdateGameOnDisconnectionUseCase {
  private readonly logger = new Logger(UpdateGameOnDisconnectionUseCase.name);

  constructor(
    @Inject('IGameRepository')
    private readonly gameRepository: IGameRepository,
    private readonly connectionManager: ConnectionManager,
  ) {}

  /**
   * Execute the disconnection update.
   * @param connectionId - Connection ID of the disconnected client
   */
  async execute(connectionId: string): Promise<void> {
    const gameCode = this.connectionManager.getGameCode(connectionId);
    if (!gameCode) {
      this.logger.warn(
        `No game code found for disconnected connection: ${connectionId}`,
      );
      return;
    }

    const playerSymbol = this.connectionManager.getPlayerSymbol(connectionId);
    this.logger.log(
      `Processing disconnection: connectionId=${connectionId}, gameCode=${gameCode}, playerSymbol=${playerSymbol}`,
    );

    // Load game from repository
    const game = await this.gameRepository.findByCode(gameCode);
    if (!game) {
      this.logger.warn(
        `Game not found for disconnection: gameCode=${gameCode}`,
      );
      return;
    }

    // Remove connection ID from players object
    const updatedPlayers = { ...game.players };
    if (playerSymbol === 'X') {
      delete updatedPlayers.X;
    } else if (playerSymbol === 'O') {
      delete updatedPlayers.O;
    }

    // Check if both players are disconnected
    const bothDisconnected =
      updatedPlayers.X === undefined && updatedPlayers.O === undefined;

    if (bothDisconnected) {
      this.logger.log(
        `Both players disconnected for game: ${gameCode}. Game state remains in Redis with TTL.`,
      );
      // Game state remains in Redis - TTL will handle cleanup
      // Optionally mark as abandoned (not implemented for MVP)
    }

    // Update game state
    const updatedGame: typeof game = {
      ...game,
      players: updatedPlayers,
      updatedAt: new Date(),
    };

    await this.gameRepository.update(updatedGame);

    this.logger.log(
      `Game state updated after disconnection: gameCode=${gameCode}, players=${JSON.stringify(updatedPlayers)}`,
    );
  }
}

