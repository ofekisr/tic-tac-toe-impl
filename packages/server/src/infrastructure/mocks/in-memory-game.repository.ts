import { Injectable } from '@nestjs/common';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { GameState } from '@fusion-tic-tac-toe/shared';

/**
 * In-memory implementation of IGameRepository for development/testing.
 * This is a temporary implementation until Redis is integrated (Epic 4).
 * 
 * Note: This implementation does NOT persist data across server restarts
 * and is NOT suitable for production use with multiple server instances.
 */
@Injectable()
export class InMemoryGameRepository implements IGameRepository {
  private readonly games: Map<string, GameState> = new Map();

  async create(game: GameState, ttl?: number): Promise<GameState> {
    this.games.set(game.gameCode, { ...game });
    // Note: TTL is ignored in in-memory implementation
    return { ...game };
  }

  async findByCode(gameCode: string): Promise<GameState | null> {
    const game = this.games.get(gameCode);
    return game ? { ...game } : null;
  }

  async update(game: GameState): Promise<GameState> {
    if (!this.games.has(game.gameCode)) {
      throw new Error(`Game not found: ${game.gameCode}`);
    }
    this.games.set(game.gameCode, { ...game });
    return { ...game };
  }
}

