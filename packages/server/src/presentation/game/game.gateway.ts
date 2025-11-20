import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { isClientMessage, ErrorMessage, ErrorCode } from '@fusion-tic-tac-toe/shared';

@WebSocketGateway({
  port: parseInt(process.env.SERVER_PORT || '3001', 10),
  path: '/',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: WebSocket): void {
    const connectionId = this.getConnectionId(client);
    console.log(`[INFO] Client connected: ${connectionId}`);
  }

  handleDisconnect(client: WebSocket): void {
    const connectionId = this.getConnectionId(client);
    console.log(`[INFO] Client disconnected: ${connectionId}`);
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
   * For now, uses a simple approach. In future stories, we'll track connections properly.
   */
  private getConnectionId(client: WebSocket): string {
    // Use a simple identifier based on the client object
    // In future stories, we'll implement proper connection tracking
    return `connection-${Math.random().toString(36).substring(2, 9)}`;
  }
}

