/**
 * Exception thrown when a game with the specified code is not found.
 */
export class GameNotFoundException extends Error {
  constructor(public readonly gameCode: string) {
    super(`Game code '${gameCode}' does not exist`);
    this.name = 'GameNotFoundException';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GameNotFoundException);
    }
  }
}

