import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { GameModule } from './game.module';
import { WebSocket } from 'ws';
import { JoinGameMessage, MakeMoveMessage, ErrorCode } from '@fusion-tic-tac-toe/shared';

describe('GameGateway', () => {
  let module: TestingModule;
  let gateway: GameGateway;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [GameModule],
    }).compile();

    gateway = module.get<GameGateway>(GameGateway);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle connection', () => {
    const mockClient = {
      readyState: 1,
    } as unknown as WebSocket;

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    gateway.handleConnection(mockClient);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Client connected:'),
    );
    consoleSpy.mockRestore();
  });

  it('should handle disconnection', () => {
    const mockClient = {
      readyState: 1,
    } as unknown as WebSocket;

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    gateway.handleDisconnect(mockClient);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Client disconnected:'),
    );
    consoleSpy.mockRestore();
  });

  describe('handleMessage', () => {
    it('should accept valid JoinGameMessage', () => {
      const mockSend = jest.fn();
      const mockClient = {
        readyState: WebSocket.OPEN,
        send: mockSend,
      } as unknown as WebSocket;

      const validMessage: JoinGameMessage = {
        type: 'join',
        gameCode: 'ABC123',
      };

      gateway.handleMessage(mockClient, validMessage);

      // Should not send error message for valid message
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should accept valid MakeMoveMessage', () => {
      const mockSend = jest.fn();
      const mockClient = {
        readyState: WebSocket.OPEN,
        send: mockSend,
      } as unknown as WebSocket;

      const validMessage: MakeMoveMessage = {
        type: 'move',
        gameCode: 'ABC123',
        row: 1,
        col: 1,
      };

      gateway.handleMessage(mockClient, validMessage);

      // Should not send error message for valid message
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should reject invalid message and send error', () => {
      const mockSend = jest.fn();
      const mockClient = {
        readyState: WebSocket.OPEN,
        send: mockSend,
      } as unknown as WebSocket;

      const invalidMessage = { type: 'invalid' };

      gateway.handleMessage(mockClient, invalidMessage);

      // Should send error message
      expect(mockSend).toHaveBeenCalledTimes(1);
      const sentMessage = JSON.parse(mockSend.mock.calls[0][0] as string);
      expect(sentMessage).toMatchObject({
        type: 'error',
        code: ErrorCode.INVALID_MESSAGE,
        message: 'Invalid message format',
      });
    });

    it('should reject null message and send error', () => {
      const mockSend = jest.fn();
      const mockClient = {
        readyState: WebSocket.OPEN,
        send: mockSend,
      } as unknown as WebSocket;

      gateway.handleMessage(mockClient, null);

      // Should send error message
      expect(mockSend).toHaveBeenCalledTimes(1);
      const sentMessage = JSON.parse(mockSend.mock.calls[0][0] as string);
      expect(sentMessage).toMatchObject({
        type: 'error',
        code: ErrorCode.INVALID_MESSAGE,
      });
    });

    it('should reject message without type field and send error', () => {
      const mockSend = jest.fn();
      const mockClient = {
        readyState: WebSocket.OPEN,
        send: mockSend,
      } as unknown as WebSocket;

      const invalidMessage = { gameCode: 'ABC123' };

      gateway.handleMessage(mockClient, invalidMessage);

      // Should send error message
      expect(mockSend).toHaveBeenCalledTimes(1);
      const sentMessage = JSON.parse(mockSend.mock.calls[0][0] as string);
      expect(sentMessage).toMatchObject({
        type: 'error',
        code: ErrorCode.INVALID_MESSAGE,
      });
    });

    it('should not send message if client is not open', () => {
      const mockSend = jest.fn();
      const mockClient = {
        readyState: WebSocket.CLOSED,
        send: mockSend,
      } as unknown as WebSocket;

      const invalidMessage = { type: 'invalid' };

      gateway.handleMessage(mockClient, invalidMessage);

      // Should not send message if client is closed
      expect(mockSend).not.toHaveBeenCalled();
    });
  });
});

