import { Test, TestingModule } from '@nestjs/testing';
import { MakeMoveUseCase } from './MakeMoveUseCase';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { GameStateService } from '../services/GameStateService';
import { ConnectionManager } from '../services/ConnectionManager';
import { GameSyncService } from '../services/GameSyncService';
import { GameState, Move, Board } from '@fusion-tic-tac-toe/shared';

describe('MakeMoveUseCase', () => {
  let useCase: MakeMoveUseCase;
  let mockRepository: jest.Mocked<IGameRepository>;
  let mockGameStateService: jest.Mocked<GameStateService>;
  let mockConnectionManager: jest.Mocked<ConnectionManager>;
  let mockGameSyncService: jest.Mocked<GameSyncService>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      exists: jest.fn(),
    };

    mockGameStateService = {
      makeMove: jest.fn(),
    } as any;

    mockConnectionManager = {
      registerConnection: jest.fn(),
      getGameCode: jest.fn(),
      getPlayerSymbol: jest.fn(),
      removeConnection: jest.fn(),
      getConnectionsByGameCode: jest.fn(),
      removeConnectionFromGame: jest.fn(),
    } as any;

    mockGameSyncService = {
      publishGameUpdate: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MakeMoveUseCase,
        {
          provide: 'IGameRepository',
          useValue: mockRepository,
        },
        {
          provide: GameStateService,
          useValue: mockGameStateService,
        },
        {
          provide: ConnectionManager,
          useValue: mockConnectionManager,
        },
        {
          provide: GameSyncService,
          useValue: mockGameSyncService,
        },
      ],
    })
      .overrideProvider('IGameRepository')
      .useValue(mockRepository)
      .compile();

    useCase = module.get<MakeMoveUseCase>(MakeMoveUseCase);
  });

  describe('execute', () => {
    it('should process a valid move and return updated game state', async () => {
      // Arrange
      const gameCode = 'ABC123';
      const move = new Move(1, 1, 'X');
      const playerSymbol: 'X' = 'X';

      const updatedGameState: GameState = {
        gameCode,
        board: new Board(),
        currentPlayer: 'O', // Turn alternated
        status: 'playing',
        players: { X: 'conn-1', O: 'conn-2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGameStateService.makeMove.mockResolvedValue(updatedGameState);

      // Act
      const result = await useCase.execute(gameCode, move, playerSymbol);

      // Assert
      expect(mockGameStateService.makeMove).toHaveBeenCalledWith(
        gameCode,
        move,
        playerSymbol,
      );
      expect(result).toEqual(updatedGameState);
      expect(result.currentPlayer).toBe('O'); // Turn should alternate
    });

    it('should throw error when game not found', async () => {
      // Arrange
      const gameCode = 'INVALID';
      const move = new Move(1, 1, 'X');
      const playerSymbol: 'X' = 'X';

      mockGameStateService.makeMove.mockRejectedValue(
        new Error('Game not found: INVALID'),
      );

      // Act & Assert
      await expect(
        useCase.execute(gameCode, move, playerSymbol),
      ).rejects.toThrow('Game not found');
    });

    it('should throw error when move is invalid', async () => {
      // Arrange
      const gameCode = 'ABC123';
      const move = new Move(1, 1, 'X');
      const playerSymbol: 'X' = 'X';

      mockGameStateService.makeMove.mockRejectedValue(
        new Error("It's not your turn. Current player: O"),
      );

      // Act & Assert
      await expect(
        useCase.execute(gameCode, move, playerSymbol),
      ).rejects.toThrow("It's not your turn");
    });

    it('should handle win condition correctly', async () => {
      // Arrange
      const gameCode = 'ABC123';
      const move = new Move(0, 0, 'X');
      const playerSymbol: 'X' = 'X';

      const board = new Board();
      board.setCell(0, 0, 'X');
      board.setCell(0, 1, 'X');
      board.setCell(0, 2, 'X'); // Winning move

      const updatedGameState: GameState = {
        gameCode,
        board,
        currentPlayer: 'X',
        status: 'finished',
        winner: 'X',
        players: { X: 'conn-1', O: 'conn-2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGameStateService.makeMove.mockResolvedValue(updatedGameState);

      // Act
      const result = await useCase.execute(gameCode, move, playerSymbol);

      // Assert
      expect(result.status).toBe('finished');
      expect(result.winner).toBe('X');
    });

    it('should handle draw condition correctly', async () => {
      // Arrange
      const gameCode = 'ABC123';
      const move = new Move(2, 2, 'O');
      const playerSymbol: 'O' = 'O';

      const board = new Board();
      // Fill board (simplified - actual draw would have full board)
      const updatedGameState: GameState = {
        gameCode,
        board,
        currentPlayer: 'O',
        status: 'finished',
        winner: undefined,
        players: { X: 'conn-1', O: 'conn-2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGameStateService.makeMove.mockResolvedValue(updatedGameState);

      // Act
      const result = await useCase.execute(gameCode, move, playerSymbol);

      // Assert
      expect(result.status).toBe('finished');
      expect(result.winner).toBeUndefined();
    });
  });
});

