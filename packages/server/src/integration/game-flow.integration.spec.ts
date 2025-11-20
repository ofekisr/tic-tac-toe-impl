import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import WebSocket from 'ws';
import { AppModule } from '../presentation/app.module';
import {
  ClientMessage,
  ServerMessage,
  JoinedMessage,
  UpdateMessage,
  WinMessage,
  DrawMessage,
  ErrorMessage,
} from '@fusion-tic-tac-toe/shared';
import { RedisService } from '../infrastructure/redis/redis.service';

/**
 * Integration tests for end-to-end game flow:
 * - Create game
 * - Join game
 * - Make moves
 * - Win condition
 * - Draw condition
 * - Error scenarios
 */
describe('Game Flow Integration Tests', () => {
  let app: INestApplication;
  let server: any;
  let redisService: RedisService;
  let serverPort: number;

  // Helper to create WebSocket client
  const createClient = (port: number): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${port}`);
      ws.on('open', () => resolve(ws));
      ws.on('error', reject);
    });
  };

  // Helper to send message and wait for response
  const sendAndWait = (
    client: WebSocket,
    message: ClientMessage,
    timeout = 5000,
  ): Promise<ServerMessage> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout waiting for response'));
      }, timeout);

      const messageHandler = (data: WebSocket.Data) => {
        clearTimeout(timer);
        client.removeListener('message', messageHandler);
        try {
          const response = JSON.parse(data.toString()) as ServerMessage;
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };

      client.on('message', messageHandler);
      client.send(JSON.stringify(message));
    });
  };

  // Helper to wait for multiple messages
  const waitForMessages = (
    client: WebSocket,
    count: number,
    timeout = 5000,
  ): Promise<ServerMessage[]> => {
    return new Promise((resolve, reject) => {
      const messages: ServerMessage[] = [];
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${count} messages`));
      }, timeout);

      const messageHandler = (data: WebSocket.Data) => {
        try {
          const response = JSON.parse(data.toString()) as ServerMessage;
          messages.push(response);
          if (messages.length >= count) {
            clearTimeout(timer);
            client.removeListener('message', messageHandler);
            resolve(messages);
          }
        } catch (error) {
          clearTimeout(timer);
          client.removeListener('message', messageHandler);
          reject(error);
        }
      };

      client.on('message', messageHandler);
    });
  };

  beforeAll(async () => {
    // Use a random port for testing
    serverPort = 3000 + Math.floor(Math.random() * 1000);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.listen(serverPort);

    redisService = moduleFixture.get<RedisService>(RedisService);
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up Redis before each test
    const client = redisService.getClient();
    const keys = await client.keys('game:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
  });

  describe('End-to-End Game Flow', () => {
    it('should create game, join game, make moves, and detect win', async () => {
      // Create two clients
      const client1 = await createClient(serverPort);
      const client2 = await createClient(serverPort);

      try {
        // Client 1: Create game
        const createResponse = (await sendAndWait(client1, {
          type: 'join',
          gameCode: 'NEW',
        })) as JoinedMessage;

        expect(createResponse.type).toBe('joined');
        expect(createResponse.playerSymbol).toBe('X');
        expect(createResponse.status).toBe('waiting');
        const gameCode = createResponse.gameCode;

        // Client 2: Join game
        const joinResponse = (await sendAndWait(client2, {
          type: 'join',
          gameCode,
        })) as JoinedMessage;

        expect(joinResponse.type).toBe('joined');
        expect(joinResponse.playerSymbol).toBe('O');
        expect(joinResponse.status).toBe('playing');

        // Client 1 should receive update message
        const update1 = (await sendAndWait(client1, {
          type: 'join',
          gameCode: 'DUMMY', // This will be ignored, we're just waiting for the update
        })) as UpdateMessage;

        // Client 1: Make move (0,0)
        const move1Response = (await sendAndWait(client1, {
          type: 'move',
          gameCode,
          row: 0,
          col: 0,
        })) as UpdateMessage;

        expect(move1Response.type).toBe('update');
        expect(move1Response.currentPlayer).toBe('O');

        // Client 2 should receive update
        const update2 = (await waitForMessages(client2, 1))[0] as UpdateMessage;
        expect(update2.type).toBe('update');
        expect(update2.currentPlayer).toBe('O');

        // Client 2: Make move (1,0)
        const move2Response = (await sendAndWait(client2, {
          type: 'move',
          gameCode,
          row: 1,
          col: 0,
        })) as UpdateMessage;

        expect(move2Response.type).toBe('update');
        expect(move2Response.currentPlayer).toBe('X');

        // Client 1: Make move (0,1) - winning move
        const move3Response = (await sendAndWait(client1, {
          type: 'move',
          gameCode,
          row: 0,
          col: 1,
        })) as UpdateMessage;

        expect(move3Response.type).toBe('update');
        expect(move3Response.currentPlayer).toBe('O');

        // Client 2: Make move (2,0)
        const move4Response = (await sendAndWait(client2, {
          type: 'move',
          gameCode,
          row: 2,
          col: 0,
        })) as UpdateMessage;

        expect(move4Response.type).toBe('update');
        expect(move4Response.currentPlayer).toBe('X');

        // Client 1: Make winning move (0,2)
        const winResponse = (await sendAndWait(client1, {
          type: 'move',
          gameCode,
          row: 0,
          col: 2,
        })) as WinMessage;

        expect(winResponse.type).toBe('win');
        expect(winResponse.winner).toBe('X');

        // Client 2 should receive win message
        const win2 = (await waitForMessages(client2, 1))[0] as WinMessage;
        expect(win2.type).toBe('win');
        expect(win2.winner).toBe('X');
      } finally {
        client1.close();
        client2.close();
      }
    }, 30000);

    it('should handle draw condition', async () => {
      const client1 = await createClient(serverPort);
      const client2 = await createClient(serverPort);

      try {
        // Create and join game
        const createResponse = (await sendAndWait(client1, {
          type: 'join',
          gameCode: 'NEW',
        })) as JoinedMessage;

        const gameCode = createResponse.gameCode;

        await sendAndWait(client2, {
          type: 'join',
          gameCode,
        });

        // Make moves to create a draw
        // X: (0,0), O: (0,1), X: (0,2)
        await sendAndWait(client1, { type: 'move', gameCode, row: 0, col: 0 });
        await waitForMessages(client2, 1);
        await sendAndWait(client2, { type: 'move', gameCode, row: 0, col: 1 });
        await waitForMessages(client1, 1);
        await sendAndWait(client1, { type: 'move', gameCode, row: 0, col: 2 });
        await waitForMessages(client2, 1);

        // O: (1,0), X: (1,1), O: (1,2)
        await sendAndWait(client2, { type: 'move', gameCode, row: 1, col: 0 });
        await waitForMessages(client1, 1);
        await sendAndWait(client1, { type: 'move', gameCode, row: 1, col: 1 });
        await waitForMessages(client2, 1);
        await sendAndWait(client2, { type: 'move', gameCode, row: 1, col: 2 });
        await waitForMessages(client1, 1);

        // X: (2,1), O: (2,0), X: (2,2) - final move creates draw
        await sendAndWait(client1, { type: 'move', gameCode, row: 2, col: 1 });
        await waitForMessages(client2, 1);
        await sendAndWait(client2, { type: 'move', gameCode, row: 2, col: 0 });
        await waitForMessages(client1, 1);

        const drawResponse = (await sendAndWait(client1, {
          type: 'move',
          gameCode,
          row: 2,
          col: 2,
        })) as DrawMessage;

        expect(drawResponse.type).toBe('draw');

        // Client 2 should receive draw message
        const draw2 = (await waitForMessages(client2, 1))[0] as DrawMessage;
        expect(draw2.type).toBe('draw');
      } finally {
        client1.close();
        client2.close();
      }
    }, 30000);
  });

  describe('Error Scenarios', () => {
    it('should reject invalid move (not player turn)', async () => {
      const client1 = await createClient(serverPort);
      const client2 = await createClient(serverPort);

      try {
        // Create and join game
        const createResponse = (await sendAndWait(client1, {
          type: 'join',
          gameCode: 'NEW',
        })) as JoinedMessage;

        const gameCode = createResponse.gameCode;

        await sendAndWait(client2, {
          type: 'join',
          gameCode,
        });

        // Client 2 tries to move when it's X's turn
        const errorResponse = (await sendAndWait(client2, {
          type: 'move',
          gameCode,
          row: 0,
          col: 0,
        })) as ErrorMessage;

        expect(errorResponse.type).toBe('error');
        expect(errorResponse.code).toBe('NOT_YOUR_TURN');
      } finally {
        client1.close();
        client2.close();
      }
    }, 10000);

    it('should reject invalid move (cell occupied)', async () => {
      const client1 = await createClient(serverPort);
      const client2 = await createClient(serverPort);

      try {
        // Create and join game
        const createResponse = (await sendAndWait(client1, {
          type: 'join',
          gameCode: 'NEW',
        })) as JoinedMessage;

        const gameCode = createResponse.gameCode;

        await sendAndWait(client2, {
          type: 'join',
          gameCode,
        });

        // Client 1 makes move
        await sendAndWait(client1, {
          type: 'move',
          gameCode,
          row: 0,
          col: 0,
        });

        await waitForMessages(client2, 1);

        // Client 2 makes move
        await sendAndWait(client2, {
          type: 'move',
          gameCode,
          row: 1,
          col: 0,
        });

        await waitForMessages(client1, 1);

        // Client 1 tries to move to occupied cell
        const errorResponse = (await sendAndWait(client1, {
          type: 'move',
          gameCode,
          row: 0,
          col: 0,
        })) as ErrorMessage;

        expect(errorResponse.type).toBe('error');
        expect(errorResponse.code).toBe('CELL_OCCUPIED');
      } finally {
        client1.close();
        client2.close();
      }
    }, 10000);

    it('should reject joining non-existent game', async () => {
      const client = await createClient(serverPort);

      try {
        const errorResponse = (await sendAndWait(client, {
          type: 'join',
          gameCode: 'INVALID',
        })) as ErrorMessage;

        expect(errorResponse.type).toBe('error');
        expect(errorResponse.code).toBe('GAME_NOT_FOUND');
      } finally {
        client.close();
      }
    }, 5000);
  });
});

