import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { isClientMessage, ErrorMessage, ErrorCode } from '@fusion-tic-tac-toe/shared';
import { ConnectionManager } from '../../application/services/ConnectionManager';
import { UpdateGameOnDisconnectionUseCase } from '../../application/use-cases/UpdateGameOnDisconnectionUseCase';


@WebSocketGateway({
  port: parseInt(process.env.SERVER_PORT || '3001', 10),
  path: '/',
})
@Injectable()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GameGateway.name);
  // Map WebSocket client to connection ID for stable tracking
  private readonly clientToConnectionId: WeakMap<WebSocket, string> =
    new WeakMap();

  constructor(
    private readonly connectionManager: ConnectionManager,
    private readonly updateGameOnDisconnectionUseCase: UpdateGameOnDisconnectionUseCase,
  ) {}

  handleConnection(client: WebSocket): void {
    const connectionId = this.getConnectionId(client);
    this.clientToConnectionId.set(client, connectionId);
    this.logger.log(`Client connected: ${connectionId}`);
  }

  async handleDisconnect(client: WebSocket): Promise<void> {
    const connectionId = this.getConnectionId(client);
    const gameCode = this.connectionManager.getGameCode(connectionId);
    const playerSymbol = this.connectionManager.getPlayerSymbol(connectionId);

    this.logger.log(
      `Client disconnected: connectionId=${connectionId}, gameCode=${gameCode || 'none'}, playerSymbol=${playerSymbol || 'none'}`,
    );

    // Update game state if connection was part of a game
    if (gameCode) {
      try {
        await this.updateGameOnDisconnectionUseCase.execute(connectionId);
      } catch (error) {
        this.logger.error(
          `Error updating game state on disconnection: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    // Remove connection from ConnectionManager
    this.connectionManager.removeConnection(connectionId);

    this.logger.log(
      `Connection cleanup completed: connectionId=${connectionId}`,
    );
  }

  /**
   * Handle incoming WebSocket messages.
   * Validates messages using type guards and sends error messages for invalid input.
   */
  @SubscribeMessage('message')
  handleMessage(client: WebSocket, payload: unknown): void {
    // Validate incoming message using type guard
    if (!isClientMessage(payload)) {
      const errorMessage: ErrorMessage = {
        type: 'error',
        code: ErrorCode.INVALID_MESSAGE,
        message: 'Invalid message format',
        details: payload,
      };
      this.sendMessage(client, errorMessage);
      return;
    }

    // Message is validated - actual handling will be implemented in future stories
    // For now, we just validate the message structure
  }

  /**
   * Send a message to a specific client.
   */
  private sendMessage(client: WebSocket, message: ErrorMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  /**
   * Get a unique identifier for the WebSocket connection.
   * Uses WeakMap to maintain stable connection IDs per client instance.
   */
  private getConnectionId(client: WebSocket): string {
    // Check if we already have a connection ID for this client
    const existingId = this.clientToConnectionId.get(client);
    if (existingId) {
      return existingId;
    }

    // Generate a new connection ID
    // In a production system, you might use a UUID library
    const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.clientToConnectionId.set(client, connectionId);
    return connectionId;
  }
}

