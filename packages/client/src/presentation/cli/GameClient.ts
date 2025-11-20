import { WebSocketClient } from '../../infrastructure/websocket/WebSocketClient';
import { BoardRenderer } from './BoardRenderer';
import { InputHandler } from './InputHandler';
import {
  ServerMessage,
  JoinedMessage,
  UpdateMessage,
  WinMessage,
  DrawMessage,
  ErrorMessage,
  MakeMoveMessage,
  PlayerSymbol,
} from '@fusion-tic-tac-toe/shared';

/**
 * GameClient orchestrates the CLI game interface.
 * 
 * Handles:
 * - WebSocket connection
 * - Message handling
 * - Board display
 * - User input
 * - Turn management
 */
export class GameClient {
  private client: WebSocketClient;
  private boardRenderer: BoardRenderer;
  private inputHandler: InputHandler;
  private gameCode: string | null = null;
  private playerSymbol: PlayerSymbol | null = null;
  private currentPlayer: PlayerSymbol | null = null;
  private isMyTurn: boolean = false;
  private gameFinished: boolean = false;

  constructor() {
    this.client = new WebSocketClient();
    this.boardRenderer = new BoardRenderer();
    this.inputHandler = new InputHandler();

    this.setupMessageHandlers();
    this.setupErrorHandlers();
  }

  /**
   * Connect to the game server.
   * 
   * @param url - WebSocket server URL
   */
  async connect(url: string): Promise<void> {
    console.log(`Connecting to ${url}...`);
    await this.client.connect(url);
    console.log('Connected!');
  }

  /**
   * Disconnect from the game server.
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
    this.inputHandler.close();
    console.log('Disconnected');
  }

  /**
   * Join a game with the given game code.
   * 
   * @param gameCode - Game code to join (or 'NEW' to create)
   */
  joinGame(gameCode: string): void {
    if (!this.client.isConnected()) {
      console.error('Not connected to server');
      return;
    }

    this.client.send({
      type: 'join',
      gameCode,
    });
  }

  /**
   * Setup message handlers for server messages.
   */
  private setupMessageHandlers(): void {
    this.client.onMessage((message: ServerMessage) => {
      switch (message.type) {
        case 'joined':
          this.handleJoinedMessage(message);
          break;
        case 'update':
          this.handleUpdateMessage(message);
          break;
        case 'win':
          this.handleWinMessage(message);
          break;
        case 'draw':
          this.handleDrawMessage(message);
          break;
        case 'error':
          this.handleErrorMessage(message);
          break;
      }
    });
  }

  /**
   * Setup error handlers.
   */
  private setupErrorHandlers(): void {
    this.client.onError((error: Error) => {
      console.error('Connection error:', error.message);
    });

    this.client.onClose(() => {
      console.log('Connection closed');
      process.exit(0);
    });
  }

  /**
   * Handle 'joined' message from server.
   */
  private handleJoinedMessage(message: JoinedMessage): void {
    this.gameCode = message.gameCode;
    this.playerSymbol = message.playerSymbol;
    this.currentPlayer = message.currentPlayer;
    this.isMyTurn = message.currentPlayer === message.playerSymbol;

    console.log(`\nGame ${message.gameCode} - You are player ${message.playerSymbol}`);
    console.log(`Status: ${message.status}`);
    console.log(`Current player: ${message.currentPlayer}\n`);

    // Display initial board
    this.boardRenderer.displayBoard(message.board);

    if (this.isMyTurn && !this.gameFinished) {
      this.promptForMove();
    } else {
      console.log('Waiting for opponent\'s move...');
    }
  }

  /**
   * Handle 'update' message from server.
   */
  private handleUpdateMessage(message: UpdateMessage): void {
    this.currentPlayer = message.currentPlayer;
    this.isMyTurn = this.currentPlayer === this.playerSymbol;

    console.log(`\nCurrent player: ${message.currentPlayer}\n`);
    this.boardRenderer.displayBoard(message.board);

    if (this.isMyTurn && !this.gameFinished) {
      this.promptForMove();
    } else {
      console.log('Waiting for opponent\'s move...');
    }
  }

  /**
   * Handle 'win' message from server.
   */
  private handleWinMessage(message: WinMessage): void {
    this.gameFinished = true;
    this.boardRenderer.displayBoard(message.board);

    if (message.winner === this.playerSymbol) {
      console.log('🎉 Game Over! You won!');
    } else {
      console.log(`😞 Game Over! Winner: ${message.winner}`);
    }
  }

  /**
   * Handle 'draw' message from server.
   */
  private handleDrawMessage(message: DrawMessage): void {
    this.gameFinished = true;
    this.boardRenderer.displayBoard(message.board);
    console.log('🤝 Game Over! It\'s a draw!');
  }

  /**
   * Handle 'error' message from server.
   */
  private handleErrorMessage(message: ErrorMessage): void {
    console.error(`Error: ${message.message}`);
    if (!this.gameFinished && this.isMyTurn) {
      this.promptForMove();
    }
  }

  /**
   * Prompt user for move input and send to server.
   */
  private async promptForMove(): Promise<void> {
    if (!this.gameCode || !this.playerSymbol || this.gameFinished) {
      return;
    }

    try {
      const { row, col } = await this.inputHandler.promptForMove(
        this.playerSymbol,
      );

      const moveMessage: MakeMoveMessage = {
        type: 'move',
        gameCode: this.gameCode,
        row,
        col,
      };

      this.client.send(moveMessage);
    } catch (error) {
      console.error('Error getting input:', error);
    }
  }
}

