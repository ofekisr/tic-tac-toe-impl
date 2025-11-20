import { GameState } from '@fusion-tic-tac-toe/shared';

/**
 * Repository interface for game persistence.
 * Implementations handle storage and retrieval of game state.
 */
export interface IGameRepository {
  /**
   * Create a new game in the repository.
   * @param game - Game state to create
   * @param ttl - Time to live in seconds (optional)
   * @returns Created game state
   */
  create(game: GameState, ttl?: number): Promise<GameState>;

  /**
   * Find a game by its code.
   * @param gameCode - Unique game code
   * @returns Game state if found, null otherwise
   */
  findByCode(gameCode: string): Promise<GameState | null>;

  /**
   * Update an existing game in the repository.
   * @param game - Updated game state
   * @returns Updated game state
   */
  update(game: GameState): Promise<GameState>;
}

