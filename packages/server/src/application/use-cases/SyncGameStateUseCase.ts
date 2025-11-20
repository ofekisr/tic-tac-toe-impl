import { Injectable, Logger, Inject } from '@nestjs/common';
import { GameState, BoardMapper, UpdateMessage, WinMessage, DrawMessage } from '@fusion-tic-tac-toe/shared';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { ConnectionManager } from '../services/ConnectionManager';
import { SyncMessage } from '../../infrastructure/redis/sync-message.types';

/**
 * Use case for handling game state synchronization from other servers.
 * 
 * When a sync message is received via Redis pub/sub:
 * 1. Parses the sync message
 * 2. Reads updated game state from Redis
 * 3. Broadcasts update to connected clients for that game
 */
@Injectable()
export class SyncGameStateUseCase {
  private readonly logger = new Logger(SyncGameStateUseCase.name);

  constructor(
    @Inject('IGameRepository')
    private readonly gameRepository: IGameRepository,
    private readonly connectionManager: ConnectionManager,
  ) {}

  /**
   * Handle a sync message received from Redis pub/sub.
   * 
   * @param channel - Redis channel (e.g., 'game:sync:ABC123')
   * @param message - JSON string of SyncMessage
   */
  async handleSyncMessage(channel: string, message: string): Promise<void> {
    let gameCode: string | null = null;
    try {
      // Parse sync message with error handling
      let syncMessage: SyncMessage;
      try {
        syncMessage = JSON.parse(message);
      } catch (parseError) {
        this.logger.error(
          `Failed to parse sync message: channel=${channel}, operation=parseMessage, error=${parseError instanceof Error ? parseError.message : String(parseError)}`,
        );
        throw new Error('Invalid sync message format');
      }

      gameCode = syncMessage.gameCode;
      this.logger.debug(
        `Received sync message: gameCode=${gameCode}, event=${syncMessage.event}`,
      );

      // Read latest game state from Redis (in case of race conditions)
      let gameState: GameState | null;
      try {
        gameState = await this.gameRepository.findByCode(gameCode);
      } catch (readError) {
        this.logger.error(
          `Failed to read game state from Redis: gameCode=${gameCode}, operation=readState, error=${readError instanceof Error ? readError.message : String(readError)}`,
        );
        throw readError;
      }

      if (!gameState) {
        this.logger.warn(
          `Game not found for sync message: gameCode=${gameCode}, operation=handleSyncMessage`,
        );
        return;
      }

      // Get all connections for this game
      const connectionIds = this.connectionManager.getConnectionsByGameCode(
        gameCode,
      );

      if (connectionIds.length === 0) {
        this.logger.debug(
          `No connected clients for game: gameCode=${gameCode}, operation=handleSyncMessage`,
        );
        return;
      }

      // Broadcast appropriate message based on event type
      // Note: The actual broadcasting is handled by GameGateway
      // This use case just processes the sync message
      this.logger.log(
        `Sync message processed: gameCode=${gameCode}, event=${syncMessage.event}, connections=${connectionIds.length}`,
      );

      return;
    } catch (error) {
      // Enhanced error logging with context
      this.logger.error(
        `Error handling sync message: channel=${channel}, gameCode=${gameCode || 'unknown'}, operation=handleSyncMessage, error=${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Re-throw to allow caller to handle
      throw error;
    }
  }

  /**
   * Get updated game state for broadcasting.
   * 
   * @param gameCode - Game code
   * @returns Updated game state or null if not found
   */
  async getGameStateForBroadcast(gameCode: string): Promise<GameState | null> {
    return this.gameRepository.findByCode(gameCode);
  }
}

