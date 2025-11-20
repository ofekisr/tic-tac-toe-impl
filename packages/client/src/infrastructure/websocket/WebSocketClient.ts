import WebSocket from 'ws';
import {
  ClientMessage,
  ServerMessage,
  isServerMessage,
} from '@fusion-tic-tac-toe/shared';

/**
 * WebSocketClient handles WebSocket connections to the game server.
 * 
 * Provides:
 * - Connection management
 * - Message sending/receiving
 * - Event handling (open, error, close, message)
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandlers: Array<(message: ServerMessage) => void> = [];
  private errorHandlers: Array<(error: Error) => void> = [];
  private closeHandlers: Array<() => void> = [];

  /**
   * Connect to a WebSocket server.
   * 
   * @param url - WebSocket server URL (e.g., 'ws://localhost:3001')
   * @returns Promise that resolves when connection is established
   */
  async connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
          resolve();
        });

        this.ws.on('error', (error: Error) => {
          this.errorHandlers.forEach((handler) => handler(error));
          reject(error);
        });

        this.ws.on('close', () => {
          this.closeHandlers.forEach((handler) => handler());
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            if (isServerMessage(message)) {
              this.messageHandlers.forEach((handler) => handler(message));
            } else {
              console.error('Invalid server message received:', message);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server.
   */
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message to the server.
   * 
   * @param message - Client message to send
   */
  send(message: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Register a handler for incoming messages.
   * 
   * @param handler - Function to call when a message is received
   */
  onMessage(handler: (message: ServerMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Register a handler for connection errors.
   * 
   * @param handler - Function to call when an error occurs
   */
  onError(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Register a handler for connection close events.
   * 
   * @param handler - Function to call when connection closes
   */
  onClose(handler: () => void): void {
    this.closeHandlers.push(handler);
  }

  /**
   * Check if the client is connected.
   * 
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

