import { GameState } from '@fusion-tic-tac-toe/shared';

/**
 * Sync event types for game state synchronization.
 */
export type SyncEventType = 'join' | 'move' | 'win' | 'draw';

/**
 * Sync message format for Redis pub/sub.
 * 
 * This message is published to `game:sync:{gameCode}` channel
 * when game state changes on any server.
 */
export interface SyncMessage {
  gameCode: string;
  event: SyncEventType;
  state: GameState;
}

/**
 * Build a sync message for publishing.
 * 
 * @param gameCode - Game code
 * @param event - Event type
 * @param state - Game state
 * @returns Sync message object
 */
export function buildSyncMessage(
  gameCode: string,
  event: SyncEventType,
  state: GameState,
): SyncMessage {
  return {
    gameCode,
    event,
    state,
  };
}

