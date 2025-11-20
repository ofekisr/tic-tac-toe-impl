import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import {
  ErrorMessage,
  ErrorCode,
  JoinGameMessage,
  MakeMoveMessage,
  JoinedMessage,
  UpdateMessage,
  WinMessage,
  DrawMessage,
  BoardMapper,
  ClientMessage,
  Move,
} from '@fusion-tic-tac-toe/shared';
import { ConnectionManager } from '../../application/services/ConnectionManager';
import { UpdateGameOnDisconnectionUseCase } from '../../application/use-cases/UpdateGameOnDisconnectionUseCase';
import { CreateGameUseCase } from '../../application/use-cases/CreateGameUseCase';
import { JoinGameUseCase } from '../../application/use-cases/JoinGameUseCase';
import { MakeMoveUseCase } from '../../application/use-cases/MakeMoveUseCase';
import { MessageValidator } from '../../application/services/MessageValidator';
import { GameSyncSubscriptionService } from '../../application/services/GameSyncSubscriptionService';
import { ErrorResponseBuilder } from '../../application/utils/ErrorResponseBuilder';
import { GameNotFoundException } from '../../domain/exceptions/GameNotFoundException';
import { GameState } from '@fusion-tic-tac-toe/shared';


@WebSocketGateway({
  port: parseInt(process.env.SERVER_PORT || '3001', 10),
  path: '/',
})
@Injectable()
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GameGateway.name);
  // Map WebSocket client to connection ID for stable tracking
  private readonly clientToConnectionId: WeakMap<WebSocket, string> =
    new WeakMap();
  // Map connection ID to WebSocket client for message broadcasting
  private readonly connectionIdToClient: Map<string, WebSocket> = new Map();

  constructor(
    private readonly connectionManager: ConnectionManager,
    private readonly updateGameOnDisconnectionUseCase: UpdateGameOnDisconnectionUseCase,
    private readonly createGameUseCase: CreateGameUseCase,
    private readonly joinGameUseCase: JoinGameUseCase,
    private readonly makeMoveUseCase: MakeMoveUseCase,
    private readonly messageValidator: MessageValidator,
    private readonly gameSyncSubscriptionService: GameSyncSubscriptionService,
  ) {}

  onModuleInit() {
    // Set broadcast handler in sync subscription service to avoid circular dependency
    this.gameSyncSubscriptionService.setBroadcastHandler(
      (gameState: GameState) => this.broadcastGameStateUpdate(gameState),
    );
  }

  handleConnection(client: WebSocket): void {
    const connectionId = this.getConnectionId(client);
    this.clientToConnectionId.set(client, connectionId);
    this.connectionIdToClient.set(connectionId, client);
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

    // Remove from connectionIdToClient mapping
    this.connectionIdToClient.delete(connectionId);

    this.logger.log(
      `Connection cleanup completed: connectionId=${connectionId}`,
    );
  }

  /**
   * Handle incoming WebSocket messages.
   * Validates messages using MessageValidator and sends error messages for invalid input.
   */
  @SubscribeMessage('message')
  async handleMessage(client: WebSocket, payload: unknown): Promise<void> {
    try {
      // Validate incoming message using MessageValidator
      const validationResult = this.messageValidator.validateMessage(payload);

      if (!validationResult.success) {
        // Send validation error
        const errorMessage = ErrorResponseBuilder.buildErrorResponse(
          validationResult.error!.code,
          validationResult.error!.message,
          validationResult.error!.details,
        );
        this.sendMessage(client, errorMessage);
        this.logger.warn(
          `Invalid message received: ${validationResult.error!.message}`,
        );
        return;
      }

      // Message is valid, proceed with handling
      const message = validationResult.message!;

      // Handle join message
      if (message.type === 'join') {
        await this.handleJoinMessage(client, message);
      } else if (message.type === 'move') {
        await this.handleMoveMessage(client, message);
      }
    } catch (error) {
      // Catch any unexpected errors during message handling
      this.logger.error(
        `Unexpected error handling message: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      const errorMessage = ErrorResponseBuilder.buildErrorResponse(
        ErrorCode.SERVER_ERROR,
        'An unexpected error occurred while processing your message',
        error instanceof Error ? { message: error.message } : { error: String(error) },
      );
      this.sendMessage(client, errorMessage);
    }
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

      // Handle joining existing game
      const joinResult = await this.joinGameUseCase.execute(
        message.gameCode,
        connectionId,
      );

      // Send joined message to joining client (O)
      const joinedMessage: JoinedMessage = {
        type: 'joined',
        gameCode: joinResult.gameState.gameCode,
        board: BoardMapper.toDTO(joinResult.gameState.board),
        currentPlayer: joinResult.gameState.currentPlayer,
        status: joinResult.gameState.status,
        playerSymbol: joinResult.playerSymbol,
      };
      this.sendMessage(client, joinedMessage);
      this.logger.log(
        `Game joined: gameCode=${joinResult.gameState.gameCode}, connectionId=${connectionId}, playerSymbol=${joinResult.playerSymbol}`,
      );

      // Send update message to first client (X)
      const firstPlayerConnectionId = joinResult.gameState.players.X;
      if (firstPlayerConnectionId) {
        const firstPlayerClient = this.connectionIdToClient.get(
          firstPlayerConnectionId,
        );
        if (firstPlayerClient) {
          const updateMessage: UpdateMessage = {
            type: 'update',
            gameCode: joinResult.gameState.gameCode,
            board: BoardMapper.toDTO(joinResult.gameState.board),
            currentPlayer: joinResult.gameState.currentPlayer,
            status: 'playing',
          };
          this.sendMessage(firstPlayerClient, updateMessage);
          this.logger.log(
            `Update sent to first player: gameCode=${joinResult.gameState.gameCode}, connectionId=${firstPlayerConnectionId}`,
          );
        } else {
          this.logger.warn(
            `First player client not found: connectionId=${firstPlayerConnectionId}`,
          );
        }
      }
    } catch (error) {
      // Handle GameNotFoundException specifically
      if (error instanceof GameNotFoundException) {
        this.logger.warn(
          `Game not found: ${error.gameCode}, connectionId=${connectionId}`,
        );
        const errorMessage = ErrorResponseBuilder.buildErrorResponse(
          ErrorCode.GAME_NOT_FOUND,
          error.message,
          { gameCode: error.gameCode },
        );
        this.sendMessage(client, errorMessage);
        return;
      }

      // Handle game full error
      if (
        error instanceof Error &&
        error.message === 'Game already has two players'
      ) {
        this.logger.warn(
          `Game is full: gameCode=${message.gameCode}, connectionId=${connectionId}`,
        );
        const errorMessage = ErrorResponseBuilder.buildErrorResponse(
          ErrorCode.GAME_FULL,
          error.message,
          { gameCode: message.gameCode },
        );
        this.sendMessage(client, errorMessage);
        return;
      }

      // Handle game not in waiting status
      if (
        error instanceof Error &&
        error.message.includes('Game is not in waiting status')
      ) {
        this.logger.warn(
          `Game not in waiting status: gameCode=${message.gameCode}, connectionId=${connectionId}`,
        );
        const errorMessage = ErrorResponseBuilder.buildErrorResponse(
          ErrorCode.GAME_FULL,
          'Game already has two players',
          { gameCode: message.gameCode },
        );
        this.sendMessage(client, errorMessage);
        return;
      }

      // Handle other errors
      this.logger.error(
        `Error handling join message: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      const errorMessage = ErrorResponseBuilder.buildErrorResponse(
        ErrorCode.SERVER_ERROR,
        'Failed to process game join',
        error instanceof Error ? { message: error.message } : { error: String(error) },
      );
      this.sendMessage(client, errorMessage);
    }
  }

  /**
   * Handle move message.
   */
  private async handleMoveMessage(
    client: WebSocket,
    message: MakeMoveMessage,
  ): Promise<void> {
    const connectionId = this.getConnectionId(client);

    try {
      // Get player symbol from connection manager
      const playerSymbol = this.connectionManager.getPlayerSymbol(connectionId);
      if (!playerSymbol) {
        const errorMessage = ErrorResponseBuilder.buildErrorResponse(
          ErrorCode.INVALID_MOVE,
          'You are not registered in a game',
        );
        this.sendMessage(client, errorMessage);
        return;
      }

      // Create Move object
      const move = new Move(message.row, message.col, playerSymbol);

      // Process move using MakeMoveUseCase
      const updatedGameState = await this.makeMoveUseCase.execute(
        message.gameCode,
        move,
        playerSymbol,
      );

      // Get all connections for this game
      const connectionIds = this.connectionManager.getConnectionsByGameCode(
        message.gameCode,
      );

      // Send appropriate message based on game status
      if (updatedGameState.status === 'finished') {
        if (updatedGameState.winner) {
          // Win message
          const winMessage: WinMessage = {
            type: 'win',
            gameCode: updatedGameState.gameCode,
            board: BoardMapper.toDTO(updatedGameState.board),
            winner: updatedGameState.winner,
          };
          this.broadcastToConnections(connectionIds, winMessage);
        } else {
          // Draw message
          const drawMessage: DrawMessage = {
            type: 'draw',
            gameCode: updatedGameState.gameCode,
            board: BoardMapper.toDTO(updatedGameState.board),
          };
          this.broadcastToConnections(connectionIds, drawMessage);
        }
      } else {
        // Update message
        const updateMessage: UpdateMessage = {
          type: 'update',
          gameCode: updatedGameState.gameCode,
          board: BoardMapper.toDTO(updatedGameState.board),
          currentPlayer: updatedGameState.currentPlayer,
          status: 'playing',
        };
        this.broadcastToConnections(connectionIds, updateMessage);
      }

      this.logger.log(
        `Move processed: gameCode=${message.gameCode}, player=${playerSymbol}, row=${message.row}, col=${message.col}`,
      );
    } catch (error) {
      // Handle validation errors
      if (error instanceof Error) {
        // Check if it's a known error code
        const errorCode = this.getErrorCodeFromMessage(error.message);
        const errorMessage = ErrorResponseBuilder.buildErrorResponse(
          errorCode,
          error.message,
        );
        this.sendMessage(client, errorMessage);
        this.logger.warn(
          `Move validation failed: ${error.message}, connectionId=${connectionId}`,
        );
      } else {
        // Unexpected error
        this.logger.error(
          `Error processing move: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
        const errorMessage = ErrorResponseBuilder.buildErrorResponse(
          ErrorCode.SERVER_ERROR,
          'Failed to process move',
          error instanceof Error ? { message: error.message } : { error: String(error) },
        );
        this.sendMessage(client, errorMessage);
      }
    }
  }

  /**
   * Get error code from error message.
   */
  private getErrorCodeFromMessage(message: string): ErrorCode {
    if (message.includes('Not your turn')) {
      return ErrorCode.NOT_YOUR_TURN;
    }
    if (message.includes('already occupied')) {
      return ErrorCode.CELL_OCCUPIED;
    }
    if (message.includes('Position must be')) {
      return ErrorCode.INVALID_POSITION;
    }
    if (message.includes('already finished')) {
      return ErrorCode.GAME_ALREADY_FINISHED;
    }
    if (message.includes('not in playing status')) {
      return ErrorCode.INVALID_MOVE;
    }
    return ErrorCode.INVALID_MOVE;
  }

  /**
   * Broadcast a message to multiple connections.
   */
  private broadcastToConnections(
    connectionIds: string[],
    message: UpdateMessage | WinMessage | DrawMessage,
  ): void {
    for (const connectionId of connectionIds) {
      const client = this.connectionIdToClient.get(connectionId);
      if (client) {
        this.sendMessage(client, message);
      }
    }
  }

  /**
   * Broadcast game state update to all connected clients for a game.
   * Called by sync service when receiving updates from other servers.
   * 
   * @param gameState - Updated game state
   */
  async broadcastGameStateUpdate(gameState: GameState): Promise<void> {
    const connectionIds = this.connectionManager.getConnectionsByGameCode(
      gameState.gameCode,
    );

    if (connectionIds.length === 0) {
      return;
    }

    // Send appropriate message based on game status
    if (gameState.status === 'finished') {
      if (gameState.winner) {
        const winMessage: WinMessage = {
          type: 'win',
          gameCode: gameState.gameCode,
          board: BoardMapper.toDTO(gameState.board),
          winner: gameState.winner,
        };
        this.broadcastToConnections(connectionIds, winMessage);
      } else {
        const drawMessage: DrawMessage = {
          type: 'draw',
          gameCode: gameState.gameCode,
          board: BoardMapper.toDTO(gameState.board),
        };
        this.broadcastToConnections(connectionIds, drawMessage);
      }
    } else {
      const updateMessage: UpdateMessage = {
        type: 'update',
        gameCode: gameState.gameCode,
        board: BoardMapper.toDTO(gameState.board),
        currentPlayer: gameState.currentPlayer,
        status: 'playing',
      };
      this.broadcastToConnections(connectionIds, updateMessage);
    }
  }

  /**
   * Send a message to a specific client.
   */
  private sendMessage(
    client: WebSocket,
    message:
      | JoinedMessage
      | UpdateMessage
      | WinMessage
      | DrawMessage
      | ErrorMessage,
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

