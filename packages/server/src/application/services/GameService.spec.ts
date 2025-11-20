import { GameService } from './GameService';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { GameCode } from '../../domain/value-objects/GameCode';

describe('GameService', () => {
  let gameService: GameService;
  let mockRepository: jest.Mocked<IGameRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      exists: jest.fn(),
    } as any;

    gameService = new GameService(mockRepository);
  });

  describe('generateUniqueGameCode', () => {
    it('should generate a unique game code when code does not exist', async () => {
      mockRepository.exists.mockResolvedValue(false);

      const code = await gameService.generateUniqueGameCode();

      expect(code).toBeDefined();
      expect(code.length).toBe(6);
      expect(GameCode.validate(code)).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledWith(code);
    });

    it('should retry when generated code already exists', async () => {
      // First call returns true (code exists), second call returns false (code is unique)
      mockRepository.exists
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const code = await gameService.generateUniqueGameCode();

      expect(code).toBeDefined();
      expect(code.length).toBe(6);
      expect(GameCode.validate(code)).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledTimes(2);
    });

    it('should retry up to 10 times when codes are duplicates', async () => {
      // All 10 attempts return true (code exists)
      mockRepository.exists.mockResolvedValue(true);

      await expect(
        gameService.generateUniqueGameCode(),
      ).rejects.toThrow('Failed to generate unique game code after 10 attempts');

      expect(mockRepository.exists).toHaveBeenCalledTimes(10);
    });

    it('should generate different codes on retry', async () => {
      const generatedCodes: string[] = [];
      let callCount = 0;

      mockRepository.exists.mockImplementation((code: string) => {
        generatedCodes.push(code);
        callCount++;
        // First 2 codes exist, third is unique
        return Promise.resolve(callCount <= 2);
      });

      const finalCode = await gameService.generateUniqueGameCode();

      expect(generatedCodes.length).toBe(3);
      expect(finalCode).toBe(generatedCodes[2]);
      // Verify all generated codes are different
      expect(new Set(generatedCodes).size).toBe(3);
    });

    it('should validate generated code format', async () => {
      mockRepository.exists.mockResolvedValue(false);

      const code = await gameService.generateUniqueGameCode();

      expect(GameCode.validate(code)).toBe(true);
      const alphanumericRegex = /^[A-Za-z0-9]+$/;
      expect(code).toMatch(alphanumericRegex);
    });
  });
});

