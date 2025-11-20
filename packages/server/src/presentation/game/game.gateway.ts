import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

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
   * Placeholder message handler structure.
   * Message handling will be implemented in Story 2.5 (Message Protocol Implementation).
   */
  @SubscribeMessage('message')
  handleMessage(client: WebSocket, payload: any): void {
    // Placeholder for future message handling
    // Will be implemented in Story 2.5
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

