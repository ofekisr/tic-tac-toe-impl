import { UpdateGameOnDisconnectionUseCase } from './UpdateGameOnDisconnectionUseCase';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { ConnectionManager } from '../services/ConnectionManager';
import { GameState, Board } from '@fusion-tic-tac-toe/shared';

describe('UpdateGameOnDisconnectionUseCase', () => {
  let useCase: UpdateGameOnDisconnectionUseCase;
  let mockGameRepository: jest.Mocked<IGameRepository>;
  let mockConnectionManager: jest.Mocked<ConnectionManager>;

  beforeEach(() => {
    mockGameRepository = {
      create: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
    } as any;

    mockConnectionManager = {
      getGameCode: jest.fn(),
      getPlayerSymbol: jest.fn(),
      registerConnection: jest.fn(),
      removeConnection: jest.fn(),
      getConnectionsByGameCode: jest.fn(),
      removeConnectionFromGame: jest.fn(),
    } as any;

    useCase = new UpdateGameOnDisconnectionUseCase(
      mockGameRepository,
      mockConnectionManager,
    );
  });

  describe('execute', () => {
    const mockGame: GameState = {
      gameCode: 'ABC123',
      board: new Board(),
      currentPlayer: 'X',
      status: 'playing',
      players: {
        X: 'conn1',
        O: 'conn2',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should remove player X from game when connection disconnects', async () => {
      mockConnectionManager.getGameCode.mockReturnValue('ABC123');
      mockConnectionManager.getPlayerSymbol.mockReturnValue('X');
      mockGameRepository.findByCode.mockResolvedValue(mockGame);
      mockGameRepository.update.mockResolvedValue(mockGame);

      await useCase.execute('conn1');

      expect(mockGameRepository.findByCode).toHaveBeenCalledWith('ABC123');
      expect(mockGameRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          gameCode: 'ABC123',
          players: {
            O: 'conn2',
          },
        }),
      );
    });

    it('should remove player O from game when connection disconnects', async () => {
      mockConnectionManager.getGameCode.mockReturnValue('ABC123');
      mockConnectionManager.getPlayerSymbol.mockReturnValue('O');
      mockGameRepository.findByCode.mockResolvedValue(mockGame);
      mockGameRepository.update.mockResolvedValue(mockGame);

      await useCase.execute('conn2');

      expect(mockGameRepository.findByCode).toHaveBeenCalledWith('ABC123');
      expect(mockGameRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          gameCode: 'ABC123',
          players: {
            X: 'conn1',
          },
        }),
      );
    });

    it('should handle both players disconnected', async () => {
      const gameWithOnePlayer: GameState = {
        ...mockGame,
        players: {
          X: 'conn1',
        },
      };

      mockConnectionManager.getGameCode.mockReturnValue('ABC123');
      mockConnectionManager.getPlayerSymbol.mockReturnValue('X');
      mockGameRepository.findByCode.mockResolvedValue(gameWithOnePlayer);
      mockGameRepository.update.mockResolvedValue(gameWithOnePlayer);

      await useCase.execute('conn1');

      expect(mockGameRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          gameCode: 'ABC123',
          players: {},
        }),
      );
    });

    it('should return early if no game code found', async () => {
      mockConnectionManager.getGameCode.mockReturnValue(undefined);

      await useCase.execute('unknown');

      expect(mockGameRepository.findByCode).not.toHaveBeenCalled();
      expect(mockGameRepository.update).not.toHaveBeenCalled();
    });

    it('should return early if game not found', async () => {
      mockConnectionManager.getGameCode.mockReturnValue('ABC123');
      mockConnectionManager.getPlayerSymbol.mockReturnValue('X');
      mockGameRepository.findByCode.mockResolvedValue(null);

      await useCase.execute('conn1');

      expect(mockGameRepository.findByCode).toHaveBeenCalledWith('ABC123');
      expect(mockGameRepository.update).not.toHaveBeenCalled();
    });

    it('should update updatedAt timestamp', async () => {
      const beforeUpdate = new Date();
      mockConnectionManager.getGameCode.mockReturnValue('ABC123');
      mockConnectionManager.getPlayerSymbol.mockReturnValue('X');
      mockGameRepository.findByCode.mockResolvedValue(mockGame);
      mockGameRepository.update.mockResolvedValue(mockGame);

      await useCase.execute('conn1');

      expect(mockGameRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: expect.any(Date),
        }),
      );

      const updateCall = mockGameRepository.update.mock.calls[0][0];
      expect(updateCall.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });
});

