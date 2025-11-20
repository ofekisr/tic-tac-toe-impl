import { GameStateService } from './GameStateService';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { MoveValidationService } from './MoveValidationService';
import { Game } from '../../domain/entities/Game';
import { Board, Move, PlayerSymbol, GameState } from '@fusion-tic-tac-toe/shared';
import { ValidationResult } from '../../domain/value-objects/ValidationResult';

describe('GameStateService', () => {
  let service: GameStateService;
  let mockRepository: jest.Mocked<IGameRepository>;
  let mockValidationService: jest.Mocked<MoveValidationService>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      exists: jest.fn(),
    };

    mockValidationService = {
      validateMove: jest.fn(),
    } as unknown as jest.Mocked<MoveValidationService>;

    const mockSyncService = {
      publishGameUpdate: jest.fn().mockResolvedValue(undefined),
    } as any;
    service = new GameStateService(mockRepository, mockValidationService, mockSyncService);
  });

  describe('makeMove', () => {
    it('should process a valid move and update game state', async () => {
      // Arrange
      const board = new Board();
      const gameState: GameState = {
        gameCode: 'ABC123',
        board,
        currentPlayer: 'X',
        status: 'playing',
        players: { X: 'conn-1', O: 'conn-2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(gameState);
      mockValidationService.validateMove.mockReturnValue({ isValid: true });
      mockRepository.update.mockResolvedValue(gameState);

      const move = new Move(1, 1, 'X');
      const playerSymbol: PlayerSymbol = 'X';

      // Act
      const result = await service.makeMove('ABC123', move, playerSymbol);

      // Assert
      expect(mockRepository.findByCode).toHaveBeenCalledWith('ABC123');
      expect(mockValidationService.validateMove).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error when game not found', async () => {
      // Arrange
      mockRepository.findByCode.mockResolvedValue(null);

      const move = new Move(1, 1, 'X');
      const playerSymbol: PlayerSymbol = 'X';

      // Act & Assert
      await expect(
        service.makeMove('INVALID', move, playerSymbol),
      ).rejects.toThrow('Game not found');
    });

    it('should throw error when move is invalid', async () => {
      // Arrange
      const board = new Board();
      const gameState: GameState = {
        gameCode: 'ABC123',
        board,
        currentPlayer: 'X',
        status: 'playing',
        players: { X: 'conn-1', O: 'conn-2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(gameState);
      mockValidationService.validateMove.mockReturnValue({
        isValid: false,
        errorCode: 'NOT_YOUR_TURN' as any,
        message: 'Not your turn',
      });

      const move = new Move(1, 1, 'X');
      const playerSymbol: PlayerSymbol = 'X';

      // Act & Assert
      await expect(
        service.makeMove('ABC123', move, playerSymbol),
      ).rejects.toThrow('Not your turn');
    });

    it('should alternate turn after valid move', async () => {
      // Arrange
      const board = new Board();
      const gameState: GameState = {
        gameCode: 'ABC123',
        board,
        currentPlayer: 'X',
        status: 'playing',
        players: { X: 'conn-1', O: 'conn-2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(gameState);
      mockValidationService.validateMove.mockReturnValue({ isValid: true });

      const move = new Move(1, 1, 'X');
      const playerSymbol: PlayerSymbol = 'X';

      // Mock update to capture the updated game state
      let updatedGameState: GameState | undefined;
      mockRepository.update.mockImplementation(async (game: GameState) => {
        updatedGameState = game;
        return game;
      });

      // Act
      await service.makeMove('ABC123', move, playerSymbol);

      // Assert
      expect(updatedGameState).toBeDefined();
      expect(updatedGameState!.currentPlayer).toBe('O'); // Turn should alternate to O
    });

    it('should update board with move', async () => {
      // Arrange
      const board = new Board();
      const gameState: GameState = {
        gameCode: 'ABC123',
        board,
        currentPlayer: 'X',
        status: 'playing',
        players: { X: 'conn-1', O: 'conn-2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(gameState);
      mockValidationService.validateMove.mockReturnValue({ isValid: true });

      const move = new Move(1, 1, 'X');
      const playerSymbol: PlayerSymbol = 'X';

      let updatedGameState: GameState | undefined;
      mockRepository.update.mockImplementation(async (game: GameState) => {
        updatedGameState = game;
        return game;
      });

      // Act
      await service.makeMove('ABC123', move, playerSymbol);

      // Assert
      expect(updatedGameState).toBeDefined();
      const updatedBoard = updatedGameState!.board;
      expect(updatedBoard.getCell(1, 1)).toBe('X'); // Cell should be updated
    });
  });
});

