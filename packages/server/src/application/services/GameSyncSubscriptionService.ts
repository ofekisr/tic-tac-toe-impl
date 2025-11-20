import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { SyncGameStateUseCase } from '../use-cases/SyncGameStateUseCase';
import { ConnectionManager } from './ConnectionManager';
import { GameState } from '@fusion-tic-tac-toe/shared';

/**
 * GameSyncSubscriptionService handles subscription to Redis pub/sub channels
 * for cross-server game state synchronization.
 */
@Injectable()
export class GameSyncSubscriptionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(GameSyncSubscriptionService.name);
  private readonly SYNC_PATTERN = 'game:sync:*';

  // Store reference to GameGateway's broadcast method
  private broadcastHandler: ((gameState: GameState) => Promise<void>) | null = null;

  constructor(
    private readonly redisService: RedisService,
    private readonly syncGameStateUseCase: SyncGameStateUseCase,
    private readonly connectionManager: ConnectionManager,
  ) {}

  /**
   * Set the broadcast handler from GameGateway.
   * Called by GameGateway after initialization to avoid circular dependency.
   */
  setBroadcastHandler(handler: (gameState: GameState) => Promise<void>): void {
    this.broadcastHandler = handler;
  }

  async onModuleInit() {
    await this.subscribeToSyncChannels();
  }

  async onModuleDestroy() {
    await this.unsubscribeFromSyncChannels();
  }

  private isSubscribed = false;

  /**
   * Subscribe to Redis pub/sub pattern for game sync messages.
   */
  private async subscribeToSyncChannels(): Promise<void> {
    if (this.isSubscribed) {
      this.logger.debug('Already subscribed to sync channels');
      return;
    }

    try {
      await this.redisService.subscribe(
        this.SYNC_PATTERN,
        async (channel: string, message: string) => {
          await this.handleSyncMessage(channel, message);
        },
      );
      this.isSubscribed = true;
      this.logger.log(`Subscribed to sync pattern: ${this.SYNC_PATTERN}`);
    } catch (error) {
      this.logger.error(
        `Error subscribing to sync channels: operation=subscribe, pattern=${this.SYNC_PATTERN}, error=${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.isSubscribed = false;
      // Retry subscription after delay
      setTimeout(() => {
        this.subscribeToSyncChannels().catch((retryError) => {
          this.logger.error(
            `Retry subscription failed: ${retryError instanceof Error ? retryError.message : String(retryError)}`,
          );
        });
      }, 5000); // Retry after 5 seconds
    }
  }

  /**
   * Unsubscribe from Redis pub/sub pattern.
   */
  private async unsubscribeFromSyncChannels(): Promise<void> {
    if (!this.isSubscribed) {
      return;
    }

    try {
      await this.redisService.unsubscribe(this.SYNC_PATTERN);
      this.isSubscribed = false;
      this.logger.log(`Unsubscribed from sync pattern: ${this.SYNC_PATTERN}`);
    } catch (error) {
      this.logger.error(
        `Error unsubscribing from sync channels: operation=unsubscribe, pattern=${this.SYNC_PATTERN}, error=${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Handle incoming sync message from Redis pub/sub.
   */
  private async handleSyncMessage(
    channel: string,
    message: string,
  ): Promise<void> {
    let gameCode: string | null = null;
    try {
      // Extract game code for error context
      gameCode = this.extractGameCodeFromChannel(channel);
      if (!gameCode) {
        this.logger.warn(
          `Could not extract game code from channel: ${channel}, operation=handleSyncMessage`,
        );
        return;
      }

      // Process sync message
      await this.syncGameStateUseCase.handleSyncMessage(channel, message);

      // Get updated game state for broadcasting
      const gameState = await this.syncGameStateUseCase.getGameStateForBroadcast(
        gameCode,
      );

      if (!gameState) {
        this.logger.warn(
          `Game state not found for sync: gameCode=${gameCode}, operation=handleSyncMessage`,
        );
        return;
      }

      // Broadcast to connected clients via GameGateway
      await this.broadcastGameUpdate(gameState);
    } catch (error) {
      // Enhanced error logging with context
      this.logger.error(
        `Error handling sync message: channel=${channel}, gameCode=${gameCode || 'unknown'}, operation=handleSyncMessage, error=${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Check if it's a parsing error
      if (error instanceof SyntaxError) {
        this.logger.warn(
          `Sync message parsing failed: channel=${channel}, message may be corrupted`,
        );
      }
    }
  }

  /**
   * Extract game code from Redis channel name.
   * Channel format: 'game:sync:ABC123'
   */
  private extractGameCodeFromChannel(channel: string): string | null {
    const parts = channel.split(':');
    if (parts.length === 3 && parts[0] === 'game' && parts[1] === 'sync') {
      return parts[2];
    }
    return null;
  }

  /**
   * Broadcast game update to connected clients.
   */
  private async broadcastGameUpdate(gameState: GameState): Promise<void> {
    this.logger.debug(
      `Broadcasting game update: gameCode=${gameState.gameCode}, status=${gameState.status}`,
    );

    if (this.broadcastHandler) {
      await this.broadcastHandler(gameState);
    } else {
      this.logger.warn('Broadcast handler not set, cannot broadcast sync update');
    }
  }
}

