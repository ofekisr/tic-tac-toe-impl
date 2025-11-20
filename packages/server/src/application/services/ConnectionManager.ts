import { Injectable } from '@nestjs/common';
import { PlayerSymbol } from '@fusion-tic-tac-toe/shared';

/**
 * ConnectionManager service tracks WebSocket connections and their association
 * with games and player symbols.
 *
 * Maintains bidirectional mappings:
 * - connectionId → gameCode
 * - connectionId → playerSymbol
 * - gameCode → connectionIds[]
 */
@Injectable()
export class ConnectionManager {
  // Map connectionId -> gameCode
  private readonly connectionToGame: Map<string, string> = new Map();

  // Map connectionId -> playerSymbol
  private readonly connectionToPlayer: Map<string, PlayerSymbol> = new Map();

  // Map gameCode -> Set of connectionIds
  private readonly gameToConnections: Map<string, Set<string>> = new Map();

  /**
   * Register a connection with a game and player symbol.
   * @param connectionId - Unique WebSocket connection identifier
   * @param gameCode - Game code the connection is participating in
   * @param playerSymbol - Player symbol assigned ('X' or 'O')
   */
  registerConnection(
    connectionId: string,
    gameCode: string,
    playerSymbol: PlayerSymbol,
  ): void {
    // If connection already exists in a different game, remove it from that game first
    const existingGameCode = this.connectionToGame.get(connectionId);
    if (existingGameCode && existingGameCode !== gameCode) {
      const oldConnections = this.gameToConnections.get(existingGameCode);
      if (oldConnections) {
        oldConnections.delete(connectionId);
        // Clean up empty game entry
        if (oldConnections.size === 0) {
          this.gameToConnections.delete(existingGameCode);
        }
      }
    }

    this.connectionToGame.set(connectionId, gameCode);
    this.connectionToPlayer.set(connectionId, playerSymbol);

    // Maintain bidirectional mapping: gameCode -> connectionIds[]
    if (!this.gameToConnections.has(gameCode)) {
      this.gameToConnections.set(gameCode, new Set());
    }
    this.gameToConnections.get(gameCode)!.add(connectionId);
  }

  /**
   * Get the game code for a connection.
   * @param connectionId - Connection identifier
   * @returns Game code if connection is registered, undefined otherwise
   */
  getGameCode(connectionId: string): string | undefined {
    return this.connectionToGame.get(connectionId);
  }

  /**
   * Get the player symbol for a connection.
   * @param connectionId - Connection identifier
   * @returns Player symbol if connection is registered, undefined otherwise
   */
  getPlayerSymbol(connectionId: string): PlayerSymbol | undefined {
    return this.connectionToPlayer.get(connectionId);
  }

  /**
   * Remove a connection from tracking.
   * @param connectionId - Connection identifier to remove
   */
  removeConnection(connectionId: string): void {
    const gameCode = this.connectionToGame.get(connectionId);

    // Remove from connection -> game mapping
    this.connectionToGame.delete(connectionId);

    // Remove from connection -> player mapping
    this.connectionToPlayer.delete(connectionId);

    // Remove from game -> connections mapping
    if (gameCode) {
      const connections = this.gameToConnections.get(gameCode);
      if (connections) {
        connections.delete(connectionId);
        // Clean up empty game entry
        if (connections.size === 0) {
          this.gameToConnections.delete(gameCode);
        }
      }
    }
  }

  /**
   * Get all connection IDs for a game.
   * @param gameCode - Game code
   * @returns Array of connection IDs participating in the game
   */
  getConnectionsByGameCode(gameCode: string): string[] {
    const connections = this.gameToConnections.get(gameCode);
    return connections ? Array.from(connections) : [];
  }

  /**
   * Remove a connection from a specific game.
   * This is a convenience method that calls removeConnection after validation.
   * @param connectionId - Connection identifier
   * @param gameCode - Game code to remove connection from
   */
  removeConnectionFromGame(connectionId: string, gameCode: string): void {
    const currentGameCode = this.connectionToGame.get(connectionId);
    if (currentGameCode === gameCode) {
      this.removeConnection(connectionId);
    }
  }
}

