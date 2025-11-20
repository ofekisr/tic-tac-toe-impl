/**
 * Repository interface for game persistence operations.
 * 
 * This interface defines the contract for game storage and retrieval,
 * allowing the domain and application layers to work with games without
 * depending on specific infrastructure implementations (e.g., Redis).
 */
export interface IGameRepository {
  /**
   * Checks if a game with the given code already exists.
   * 
   * @param gameCode - The game code to check
   * @returns Promise that resolves to true if the game exists, false otherwise
   */
  exists(gameCode: string): Promise<boolean>;
}

