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
} from '@fusion-tic-tac-toe/shared';
import { RedisService } from '../infrastructure/redis/redis.service';

/**
 * Integration tests for multi-server synchronization:
 * - Two servers, two clients
 * - Move on Server A appears on Server B client
 * - State consistency across servers
 */
describe('Multi-Server Synchronization Integration Tests', () => {
  let app1: INestApplication;
  let app2: INestApplication;
  let server1: any;
  let server2: any;
  let redisService: RedisService;
  let serverPort1: number;
  let serverPort2: number;

  const createClient = (port: number): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${port}`);
      ws.on('open', () => resolve(ws));
      ws.on('error', reject);
    });
  };

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
    // Use random ports for testing
    serverPort1 = 4000 + Math.floor(Math.random() * 1000);
    serverPort2 = serverPort1 + 1;

    // Create first server
    const moduleFixture1: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app1 = moduleFixture1.createNestApplication();
    app1.useWebSocketAdapter(new WsAdapter(app1));
    await app1.listen(serverPort1);

    // Create second server
    const moduleFixture2: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app2 = moduleFixture2.createNestApplication();
    app2.useWebSocketAdapter(new WsAdapter(app2));
    await app2.listen(serverPort2);

    redisService = moduleFixture1.get<RedisService>(RedisService);
    server1 = app1.getHttpServer();
    server2 = app2.getHttpServer();
  });

  afterAll(async () => {
    await app1.close();
    await app2.close();
  });

  beforeEach(async () => {
    // Clean up Redis before each test
    const client = redisService.getClient();
    const keys = await client.keys('game:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
  });

  it('should sync move from Server A to Server B client', async () => {
    // Client 1 on Server A
    const client1 = await createClient(serverPort1);
    // Client 2 on Server B
    const client2 = await createClient(serverPort2);

    try {
      // Client 1 creates game on Server A
      const createResponse = (await sendAndWait(client1, {
        type: 'join',
        gameCode: 'NEW',
      })) as JoinedMessage;

      expect(createResponse.type).toBe('joined');
      expect(createResponse.playerSymbol).toBe('X');
      const gameCode = createResponse.gameCode;

      // Wait a bit for sync message to propagate
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Client 2 joins game on Server B
      const joinResponse = (await sendAndWait(client2, {
        type: 'join',
        gameCode,
      })) as JoinedMessage;

      expect(joinResponse.type).toBe('joined');
      expect(joinResponse.playerSymbol).toBe('O');

      // Client 1 should receive update on Server A
      const update1 = (await waitForMessages(client1, 1, 2000))[0] as UpdateMessage;
      expect(update1.type).toBe('update');
      expect(update1.status).toBe('playing');

      // Client 1 makes move on Server A
      const moveResponse = (await sendAndWait(client1, {
        type: 'move',
        gameCode,
        row: 0,
        col: 0,
      })) as UpdateMessage;

      expect(moveResponse.type).toBe('update');
      expect(moveResponse.currentPlayer).toBe('O');

      // Wait for sync to propagate
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Client 2 on Server B should receive update
      const syncUpdate = (await waitForMessages(client2, 1, 2000))[0] as UpdateMessage;
      expect(syncUpdate.type).toBe('update');
      expect(syncUpdate.currentPlayer).toBe('O');
      expect(syncUpdate.board[0][0]).toBe('X');
    } finally {
      client1.close();
      client2.close();
    }
  }, 30000);

  it('should maintain state consistency across servers', async () => {
    const client1 = await createClient(serverPort1);
    const client2 = await createClient(serverPort2);

    try {
      // Create game on Server A
      const createResponse = (await sendAndWait(client1, {
        type: 'join',
        gameCode: 'NEW',
      })) as JoinedMessage;

      const gameCode = createResponse.gameCode;

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Join game on Server B
      await sendAndWait(client2, {
        type: 'join',
        gameCode,
      });

      await waitForMessages(client1, 1);

      // Make several moves
      await sendAndWait(client1, { type: 'move', gameCode, row: 0, col: 0 });
      await new Promise((resolve) => setTimeout(resolve, 200));
      await waitForMessages(client2, 1);

      await sendAndWait(client2, { type: 'move', gameCode, row: 1, col: 1 });
      await new Promise((resolve) => setTimeout(resolve, 200));
      await waitForMessages(client1, 1);

      await sendAndWait(client1, { type: 'move', gameCode, row: 0, col: 1 });
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Client 2 should receive sync update
      const finalUpdate = (await waitForMessages(client2, 1, 2000))[0] as UpdateMessage;
      expect(finalUpdate.board[0][0]).toBe('X');
      expect(finalUpdate.board[0][1]).toBe('X');
      expect(finalUpdate.board[1][1]).toBe('O');
      expect(finalUpdate.currentPlayer).toBe('O');
    } finally {
      client1.close();
      client2.close();
    }
  }, 30000);
});

