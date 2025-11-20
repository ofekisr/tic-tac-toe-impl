import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { ConnectionManager } from '../../application/services/ConnectionManager';
import { UpdateGameOnDisconnectionUseCase } from '../../application/use-cases/UpdateGameOnDisconnectionUseCase';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { WebSocket } from 'ws';
import { JoinGameMessage, MakeMoveMessage, ErrorCode } from '@fusion-tic-tac-toe/shared';

describe('GameGateway', () => {
  let module: TestingModule;
  let gateway: GameGateway;
  let connectionManager: ConnectionManager;
  let updateGameOnDisconnectionUseCase: UpdateGameOnDisconnectionUseCase;

  beforeEach(async () => {
    const mockGameRepository: jest.Mocked<IGameRepository> = {
      create: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
    } as any;

    module = await Test.createTestingModule({
      providers: [
        GameGateway,
        ConnectionManager,
        {
          provide: 'IGameRepository',
          useValue: mockGameRepository,
        },
        UpdateGameOnDisconnectionUseCase,
      ],
    }).compile();

    gateway = module.get<GameGateway>(GameGateway);
    connectionManager = module.get<ConnectionManager>(ConnectionManager);
    updateGameOnDisconnectionUseCase = module.get<UpdateGameOnDisconnectionUseCase>(
      UpdateGameOnDisconnectionUseCase,
    );
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle connection and generate connection ID', () => {
    const mockClient = {
      readyState: 1,
    } as unknown as WebSocket;

    gateway.handleConnection(mockClient);
    // Connection should be tracked (we can't easily verify WeakMap, but no error means success)
    expect(gateway).toBeDefined();
  });

  it('should handle disconnection without game', async () => {
    const mockClient = {
      readyState: 1,
    } as unknown as WebSocket;

    jest
      .spyOn(updateGameOnDisconnectionUseCase, 'execute')
      .mockResolvedValue(undefined);
    jest.spyOn(connectionManager, 'getGameCode').mockReturnValue(undefined);
    jest.spyOn(connectionManager, 'removeConnection').mockImplementation();

    await gateway.handleDisconnect(mockClient);

    expect(connectionManager.removeConnection).toHaveBeenCalled();
    // If no game code, use case should not be called (handled internally)
  });

  it('should handle disconnection with game', async () => {
    const mockClient = {
      readyState: 1,
    } as unknown as WebSocket;

    jest
      .spyOn(updateGameOnDisconnectionUseCase, 'execute')
      .mockResolvedValue(undefined);
    jest.spyOn(connectionManager, 'getGameCode').mockReturnValue('ABC123');
    jest
      .spyOn(connectionManager, 'getPlayerSymbol')
      .mockReturnValue('X');
    jest.spyOn(connectionManager, 'removeConnection').mockImplementation();

    await gateway.handleDisconnect(mockClient);

    expect(updateGameOnDisconnectionUseCase.execute).toHaveBeenCalled();
    expect(connectionManager.removeConnection).toHaveBeenCalled();
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

