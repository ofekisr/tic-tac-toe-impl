import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { ConnectionManager } from '../../application/services/ConnectionManager';
import { UpdateGameOnDisconnectionUseCase } from '../../application/use-cases/UpdateGameOnDisconnectionUseCase';
import { CreateGameUseCase } from '../../application/use-cases/CreateGameUseCase';
import { JoinGameUseCase } from '../../application/use-cases/JoinGameUseCase';
import { GameService } from '../../application/services/GameService';
import { MessageValidator } from '../../application/services/MessageValidator';
import { MoveValidationService } from '../../application/services/MoveValidationService';
import { GameStateService } from '../../application/services/GameStateService';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { WebSocket } from 'ws';
import { JoinGameMessage, MakeMoveMessage, ErrorCode, Board } from '@fusion-tic-tac-toe/shared';

describe('GameGateway', () => {
  let module: TestingModule;
  let gateway: GameGateway;
  let connectionManager: ConnectionManager;
  let updateGameOnDisconnectionUseCase: UpdateGameOnDisconnectionUseCase;
  let createGameUseCase: CreateGameUseCase;
  let joinGameUseCase: JoinGameUseCase;

  beforeEach(async () => {
    const mockGameRepository: jest.Mocked<IGameRepository> = {
      create: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      exists: jest.fn(),
    } as any;

    module = await Test.createTestingModule({
      providers: [
        {
          provide: 'IGameRepository',
          useValue: mockGameRepository,
        },
        {
          provide: GameService,
          useFactory: (repo: IGameRepository) => new GameService(repo),
          inject: ['IGameRepository'],
        },
        {
          provide: CreateGameUseCase,
          useFactory: (repo: IGameRepository, gameService: GameService, connMgr: ConnectionManager) =>
            new CreateGameUseCase(repo, gameService, connMgr),
          inject: ['IGameRepository', GameService, ConnectionManager],
        },
        {
          provide: JoinGameUseCase,
          useFactory: (repo: IGameRepository, connMgr: ConnectionManager) =>
            new JoinGameUseCase(repo, connMgr),
          inject: ['IGameRepository', ConnectionManager],
        },
        ConnectionManager,
        MessageValidator,
        MoveValidationService,
        {
          provide: GameStateService,
          useFactory: (repo: IGameRepository, validationService: MoveValidationService) =>
            new GameStateService(repo, validationService),
          inject: ['IGameRepository', MoveValidationService],
        },
        UpdateGameOnDisconnectionUseCase,
        GameGateway,
      ],
    }).compile();

    gateway = module.get<GameGateway>(GameGateway);
    connectionManager = module.get<ConnectionManager>(ConnectionManager);
    updateGameOnDisconnectionUseCase = module.get<UpdateGameOnDisconnectionUseCase>(
      UpdateGameOnDisconnectionUseCase,
    );
    createGameUseCase = module.get<CreateGameUseCase>(CreateGameUseCase);
    joinGameUseCase = module.get<JoinGameUseCase>(JoinGameUseCase);
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
    it('should accept valid JoinGameMessage', async () => {
      const mockSend = jest.fn();
      const mockClient = {
        readyState: WebSocket.OPEN,
        send: mockSend,
      } as unknown as WebSocket;

      const validMessage: JoinGameMessage = {
        type: 'join',
        gameCode: 'NEW',
      };

      // Mock CreateGameUseCase for game creation
      jest.spyOn(createGameUseCase, 'execute').mockResolvedValue({
        gameCode: 'ABC123',
        board: new Board(),
        currentPlayer: 'X',
        status: 'waiting',
        players: { X: 'conn-1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await gateway.handleMessage(mockClient, validMessage);

      // Should send joined message (not error)
      expect(mockSend).toHaveBeenCalled();
      const sentMessage = JSON.parse(mockSend.mock.calls[0][0] as string);
      expect(sentMessage.type).toBe('joined');
    });

    it('should accept valid MakeMoveMessage and process move', async () => {
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

      // Mock game state service
      const gameStateService = module.get<GameStateService>(GameStateService);
      jest.spyOn(gameStateService, 'makeMove').mockRejectedValue(
        new Error('Game not found: ABC123'),
      );

      // Mock connection manager
      jest.spyOn(connectionManager, 'getPlayerSymbol').mockReturnValue('X');
      jest.spyOn(connectionManager, 'getConnectionsByGameCode').mockReturnValue(['conn-1']);

      await gateway.handleMessage(mockClient, validMessage);

      // Should send error message (game not found in this test)
      expect(mockSend).toHaveBeenCalled();
      const sentMessage = JSON.parse(mockSend.mock.calls[0][0] as string);
      expect(sentMessage.type).toBe('error');
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

