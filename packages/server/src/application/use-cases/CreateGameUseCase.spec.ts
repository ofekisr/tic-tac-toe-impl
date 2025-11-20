import { Test, TestingModule } from '@nestjs/testing';
import { CreateGameUseCase } from './CreateGameUseCase';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { GameService } from '../services/GameService';
import { ConnectionManager } from '../services/ConnectionManager';
import { GameSyncService } from '../services/GameSyncService';
import { GameState, Board } from '@fusion-tic-tac-toe/shared';

describe('CreateGameUseCase', () => {
  let useCase: CreateGameUseCase;
  let mockRepository: jest.Mocked<IGameRepository>;
  let mockGameService: jest.Mocked<GameService>;
  let mockConnectionManager: jest.Mocked<ConnectionManager>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      exists: jest.fn(),
    };

    mockGameService = {
      generateUniqueGameCode: jest.fn(),
    } as any;

    mockConnectionManager = {
      registerConnection: jest.fn(),
      getGameCode: jest.fn(),
      getPlayerSymbol: jest.fn(),
      removeConnection: jest.fn(),
      getConnectionsByGameCode: jest.fn(),
      removeConnectionFromGame: jest.fn(),
    } as any;

    const mockSyncService = {
      publishGameUpdate: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGameUseCase,
        {
          provide: 'IGameRepository',
          useValue: mockRepository,
        },
        {
          provide: GameService,
          useValue: mockGameService,
        },
        {
          provide: ConnectionManager,
          useValue: mockConnectionManager,
        },
        {
          provide: GameSyncService,
          useValue: mockSyncService,
        },
      ],
    })
      .overrideProvider('IGameRepository')
      .useValue(mockRepository)
      .compile();

    useCase = module.get<CreateGameUseCase>(CreateGameUseCase);
  });

  describe('execute', () => {
    it('should create a game with correct initial state', async () => {
      const connectionId = 'conn-123';
      const gameCode = 'ABC123';

      mockGameService.generateUniqueGameCode.mockResolvedValue(gameCode);
      mockRepository.create.mockImplementation(async (game: GameState) => game);

      const result = await useCase.execute(connectionId);

      expect(mockGameService.generateUniqueGameCode).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gameCode,
          currentPlayer: 'X',
          status: 'waiting',
          winner: undefined,
          players: { X: connectionId },
        }),
        3600, // TTL
      );
      expect(mockConnectionManager.registerConnection).toHaveBeenCalledWith(
        connectionId,
        gameCode,
        'X',
      );

      expect(result.gameCode).toBe(gameCode);
      expect(result.currentPlayer).toBe('X');
      expect(result.status).toBe('waiting');
      expect(result.players.X).toBe(connectionId);
      expect(result.players.O).toBeUndefined();
    });

    it('should create game with empty 3x3 board', async () => {
      const connectionId = 'conn-123';
      const gameCode = 'ABC123';

      mockGameService.generateUniqueGameCode.mockResolvedValue(gameCode);
      mockRepository.create.mockImplementation(async (game: GameState) => game);

      const result = await useCase.execute(connectionId);

      const boardArray = result.board.toArray();
      expect(boardArray).toHaveLength(3);
      expect(boardArray[0]).toEqual(['', '', '']);
      expect(boardArray[1]).toEqual(['', '', '']);
      expect(boardArray[2]).toEqual(['', '', '']);
    });

    it('should store game with TTL of 3600 seconds', async () => {
      const connectionId = 'conn-123';
      const gameCode = 'ABC123';

      mockGameService.generateUniqueGameCode.mockResolvedValue(gameCode);
      mockRepository.create.mockImplementation(async (game: GameState) => game);

      await useCase.execute(connectionId);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.any(Object),
        3600,
      );
    });

    it('should assign player X to creating client', async () => {
      const connectionId = 'conn-123';
      const gameCode = 'ABC123';

      mockGameService.generateUniqueGameCode.mockResolvedValue(gameCode);
      mockRepository.create.mockImplementation(async (game: GameState) => game);

      const result = await useCase.execute(connectionId);

      expect(result.players.X).toBe(connectionId);
      expect(result.players.O).toBeUndefined();
      expect(mockConnectionManager.registerConnection).toHaveBeenCalledWith(
        connectionId,
        gameCode,
        'X',
      );
    });
  });
});

