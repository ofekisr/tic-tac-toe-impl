import { Test, TestingModule } from '@nestjs/testing';
import { JoinGameUseCase } from './JoinGameUseCase';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { ConnectionManager } from '../services/ConnectionManager';
import { GameSyncService } from '../services/GameSyncService';
import { GameState, Board } from '@fusion-tic-tac-toe/shared';
import { GameNotFoundException } from '../../domain/exceptions/GameNotFoundException';

describe('JoinGameUseCase', () => {
  let useCase: JoinGameUseCase;
  let mockRepository: jest.Mocked<IGameRepository>;
  let mockConnectionManager: jest.Mocked<ConnectionManager>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      exists: jest.fn(),
    };

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
        JoinGameUseCase,
        {
          provide: 'IGameRepository',
          useValue: mockRepository,
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
    }).compile();

    useCase = module.get<JoinGameUseCase>(JoinGameUseCase);
  });

  describe('execute', () => {
    it('should successfully join a waiting game', async () => {
      const gameCode = 'ABC123';
      const connectionIdX = 'conn-1';
      const connectionIdO = 'conn-2';

      const existingGame: GameState = {
        gameCode,
        board: new Board(),
        currentPlayer: 'X',
        status: 'waiting',
        players: { X: connectionIdX },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(existingGame);
      mockRepository.update.mockImplementation(async (game: GameState) => game);

      const result = await useCase.execute(gameCode, connectionIdO);

      expect(mockRepository.findByCode).toHaveBeenCalledWith(gameCode);
      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          gameCode,
          status: 'playing',
          currentPlayer: 'X',
          players: { X: connectionIdX, O: connectionIdO },
        }),
      );
      expect(mockConnectionManager.registerConnection).toHaveBeenCalledWith(
        connectionIdO,
        gameCode,
        'O',
      );

      expect(result.gameState.status).toBe('playing');
      expect(result.gameState.players.X).toBe(connectionIdX);
      expect(result.gameState.players.O).toBe(connectionIdO);
      expect(result.playerSymbol).toBe('O');
    });

    it('should throw GameNotFoundException if game does not exist', async () => {
      const gameCode = 'NONEXIST';
      const connectionId = 'conn-1';

      mockRepository.findByCode.mockResolvedValue(null);

      await expect(useCase.execute(gameCode, connectionId)).rejects.toThrow(
        GameNotFoundException,
      );
      expect(mockRepository.findByCode).toHaveBeenCalledWith(gameCode);
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockConnectionManager.registerConnection).not.toHaveBeenCalled();
    });

    it('should throw error if game status is not waiting', async () => {
      const gameCode = 'ABC123';
      const connectionId = 'conn-2';

      const playingGame: GameState = {
        gameCode,
        board: new Board(),
        currentPlayer: 'X',
        status: 'playing',
        players: { X: 'conn-1', O: 'conn-2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(playingGame);

      await expect(useCase.execute(gameCode, connectionId)).rejects.toThrow(
        'Game is not in waiting status',
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if game is full (two players already)', async () => {
      const gameCode = 'ABC123';
      const connectionId = 'conn-3';

      const fullGame: GameState = {
        gameCode,
        board: new Board(),
        currentPlayer: 'X',
        status: 'waiting',
        players: { X: 'conn-1', O: 'conn-2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(fullGame);

      await expect(useCase.execute(gameCode, connectionId)).rejects.toThrow(
        'Game already has two players',
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should set currentPlayer to X when game starts', async () => {
      const gameCode = 'ABC123';
      const connectionIdX = 'conn-1';
      const connectionIdO = 'conn-2';

      const existingGame: GameState = {
        gameCode,
        board: new Board(),
        currentPlayer: 'X',
        status: 'waiting',
        players: { X: connectionIdX },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(existingGame);
      mockRepository.update.mockImplementation(async (game: GameState) => game);

      const result = await useCase.execute(gameCode, connectionIdO);

      expect(result.gameState.currentPlayer).toBe('X');
    });
  });
});

