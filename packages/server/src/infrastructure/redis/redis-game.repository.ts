import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { GameState, Board, BoardMapper, BoardDTO } from '@fusion-tic-tac-toe/shared';

/**
 * Redis implementation of IGameRepository.
 * 
 * Stores game state as Redis hash at key `game:{gameCode}` with TTL support.
 * Serializes/deserializes between GameState domain objects and Redis hash format.
 */
@Injectable()
export class RedisGameRepository
  implements IGameRepository, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisGameRepository.name);
  private redis: Redis;

  constructor() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD;

    this.redis = new Redis({
      host,
      port,
      password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(
          `Redis connection retry attempt ${times}, delay ${delay}ms`,
        );
        return delay;
      },
    });

    this.redis.on('connect', () => {
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });

    this.redis.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`, error.stack);
    });
  }

  onModuleInit() {
    // Connection is established in constructor
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  /**
   * Get Redis key for a game code.
   */
  private getGameKey(gameCode: string): string {
    return `game:${gameCode}`;
  }

  /**
   * Serialize GameState to Redis hash format.
   */
  private serializeGame(game: GameState): Record<string, string> {
    const boardDTO = BoardMapper.toDTO(game.board);
    return {
      gameCode: game.gameCode,
      board: JSON.stringify(boardDTO),
      currentPlayer: game.currentPlayer,
      status: game.status,
      winner: game.winner || '',
      players: JSON.stringify(game.players),
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
    };
  }

  /**
   * Deserialize Redis hash to GameState.
   */
  private deserializeGame(hash: Record<string, string>): GameState {
    const boardDTO = JSON.parse(hash.board) as BoardDTO;
    const board = BoardMapper.fromDTO(boardDTO);
    const players = JSON.parse(hash.players) as {
      X?: string;
      O?: string;
    };

    return {
      gameCode: hash.gameCode,
      board,
      currentPlayer: hash.currentPlayer as 'X' | 'O',
      status: hash.status as 'waiting' | 'playing' | 'finished',
      winner: hash.winner === '' ? undefined : (hash.winner as 'X' | 'O'),
      players,
      createdAt: new Date(hash.createdAt),
      updatedAt: new Date(hash.updatedAt),
    };
  }

  async create(game: GameState, ttl?: number): Promise<GameState> {
    const key = this.getGameKey(game.gameCode);
    const hash = this.serializeGame(game);

    await this.redis.hset(key, hash);

    if (ttl) {
      await this.redis.expire(key, ttl);
      this.logger.log(
        `Game stored in Redis: ${key}, TTL=${ttl}s`,
      );
    } else {
      this.logger.log(`Game stored in Redis: ${key} (no TTL)`);
    }

    return { ...game };
  }

  async findByCode(gameCode: string): Promise<GameState | null> {
    const key = this.getGameKey(gameCode);
    const hash = await this.redis.hgetall(key);

    if (!hash || Object.keys(hash).length === 0) {
      return null;
    }

    try {
      return this.deserializeGame(hash);
    } catch (error) {
      this.logger.error(
        `Error deserializing game ${gameCode}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  async update(game: GameState): Promise<GameState> {
    const key = this.getGameKey(game.gameCode);
    const exists = await this.redis.exists(key);

    if (!exists) {
      throw new Error(`Game not found: ${game.gameCode}`);
    }

    const hash = this.serializeGame(game);
    await this.redis.hset(key, hash);

    // Preserve existing TTL
    const ttl = await this.redis.ttl(key);
    if (ttl > 0) {
      await this.redis.expire(key, ttl);
    }

    this.logger.log(`Game updated in Redis: ${key}`);
    return { ...game };
  }

  async exists(gameCode: string): Promise<boolean> {
    const key = this.getGameKey(gameCode);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }
}

