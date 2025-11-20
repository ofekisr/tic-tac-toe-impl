import { Injectable, Logger } from '@nestjs/common';
import { GameState } from '@fusion-tic-tac-toe/shared';
import { RedisService } from '../../infrastructure/redis/redis.service';
import {
  SyncEventType,
  buildSyncMessage,
} from '../../infrastructure/redis/sync-message.types';

/**
 * GameSyncService handles publishing game state updates to Redis pub/sub
 * for cross-server synchronization.
 */
@Injectable()
export class GameSyncService {
  private readonly logger = new Logger(GameSyncService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Publish a game state update to Redis pub/sub.
   * 
   * @param gameCode - Game code
   * @param event - Event type (join, move, win, draw)
   * @param gameState - Updated game state
   */
  async publishGameUpdate(
    gameCode: string,
    event: SyncEventType,
    gameState: GameState,
  ): Promise<void> {
    try {
      const syncMessage = buildSyncMessage(gameCode, event, gameState);
      const channel = `game:sync:${gameCode}`;
      const message = JSON.stringify(syncMessage);

      await this.redisService.publish(channel, message);
      this.logger.debug(
        `Published sync message: gameCode=${gameCode}, event=${event}, channel=${channel}`,
      );
    } catch (error) {
      // Log error with context but don't throw - sync failures shouldn't break game operations
      this.logger.error(
        `Error publishing game update: gameCode=${gameCode}, event=${event}, operation=publish, error=${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Continue operation - local game state is still valid
    }
  }
}

