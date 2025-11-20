import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import {
  isClientMessage,
  ErrorMessage,
  ErrorCode,
  JoinGameMessage,
  JoinedMessage,
  BoardMapper,
} from '@fusion-tic-tac-toe/shared';
import { ConnectionManager } from '../../application/services/ConnectionManager';
import { UpdateGameOnDisconnectionUseCase } from '../../application/use-cases/UpdateGameOnDisconnectionUseCase';
import { CreateGameUseCase } from '../../application/use-cases/CreateGameUseCase';


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
    private readonly createGameUseCase: CreateGameUseCase,
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
  async handleMessage(client: WebSocket, payload: unknown): Promise<void> {
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

    // Handle join message
    if (payload.type === 'join') {
      await this.handleJoinMessage(client, payload);
    }
    // Move messages will be handled in future stories
  }

  /**
   * Handle join game message.
   * If gameCode is 'NEW', creates a new game.
   * Otherwise, joins an existing game (to be implemented in Story 2.4).
   */
  private async handleJoinMessage(
    client: WebSocket,
    message: JoinGameMessage,
  ): Promise<void> {
    const connectionId = this.getConnectionId(client);

    try {
      // Handle game creation (gameCode === 'NEW')
      if (message.gameCode === 'NEW') {
        const gameState = await this.createGameUseCase.execute(connectionId);

        // Send joined message to client
        const joinedMessage: JoinedMessage = {
          type: 'joined',
          gameCode: gameState.gameCode,
          board: BoardMapper.toDTO(gameState.board),
          currentPlayer: gameState.currentPlayer,
          status: gameState.status,
          playerSymbol: 'X', // Creating player is always 'X'
        };

        this.sendMessage(client, joinedMessage);
        this.logger.log(
          `Game created: gameCode=${gameState.gameCode}, connectionId=${connectionId}`,
        );
        return;
      }

      // Joining existing game will be implemented in Story 2.4
      // For now, send error for non-NEW game codes
      const errorMessage: ErrorMessage = {
        type: 'error',
        code: ErrorCode.GAME_NOT_FOUND,
        message: 'Game joining not yet implemented',
        details: { gameCode: message.gameCode },
      };
      this.sendMessage(client, errorMessage);
    } catch (error) {
      this.logger.error(
        `Error handling join message: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      const errorMessage: ErrorMessage = {
        type: 'error',
        code: ErrorCode.SERVER_ERROR,
        message: 'Failed to process game creation',
        details: error instanceof Error ? error.message : String(error),
      };
      this.sendMessage(client, errorMessage);
    }
  }

  /**
   * Send a message to a specific client.
   */
  private sendMessage(
    client: WebSocket,
    message: JoinedMessage | ErrorMessage,
  ): void {
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

