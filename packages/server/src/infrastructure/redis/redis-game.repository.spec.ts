import { Test, TestingModule } from '@nestjs/testing';
import { RedisGameRepository } from './redis-game.repository';
import Redis from 'ioredis';
import { GameState, Board } from '@fusion-tic-tac-toe/shared';

// Mock ioredis
jest.mock('ioredis');

describe('RedisGameRepository', () => {
  let repository: RedisGameRepository;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(async () => {
    // Create mock Redis instance
    mockRedis = {
      hset: jest.fn(),
      hgetall: jest.fn(),
      expire: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn(),
    } as any;

    // Mock Redis constructor
    (Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => mockRedis);

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisGameRepository],
    }).compile();

    repository = module.get<RedisGameRepository>(RedisGameRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should store game state in Redis hash', async () => {
      const game: GameState = {
        gameCode: 'ABC123',
        board: new Board(),
        currentPlayer: 'X',
        status: 'waiting',
        winner: undefined,
        players: { X: 'conn-1' },
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      mockRedis.hset.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const result = await repository.create(game, 3600);

      expect(mockRedis.hset).toHaveBeenCalledWith(
        'game:ABC123',
        expect.objectContaining({
          gameCode: 'ABC123',
          currentPlayer: 'X',
          status: 'waiting',
        }),
      );
      expect(mockRedis.expire).toHaveBeenCalledWith('game:ABC123', 3600);
      expect(result.gameCode).toBe('ABC123');
    });

    it('should store game without TTL if not provided', async () => {
      const game: GameState = {
        gameCode: 'ABC123',
        board: new Board(),
        currentPlayer: 'X',
        status: 'waiting',
        players: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRedis.hset.mockResolvedValue(1);

      await repository.create(game);

      expect(mockRedis.hset).toHaveBeenCalled();
      expect(mockRedis.expire).not.toHaveBeenCalled();
    });
  });

  describe('findByCode', () => {
    it('should retrieve game state from Redis', async () => {
      const boardDTO = [['', '', ''], ['', '', ''], ['', '', '']];
      mockRedis.hgetall.mockResolvedValue({
        gameCode: 'ABC123',
        board: JSON.stringify(boardDTO),
        currentPlayer: 'X',
        status: 'waiting',
        winner: '',
        players: JSON.stringify({ X: 'conn-1' }),
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      });

      const result = await repository.findByCode('ABC123');

      expect(mockRedis.hgetall).toHaveBeenCalledWith('game:ABC123');
      expect(result).not.toBeNull();
      expect(result?.gameCode).toBe('ABC123');
      expect(result?.currentPlayer).toBe('X');
      expect(result?.status).toBe('waiting');
    });

    it('should return null if game does not exist', async () => {
      mockRedis.hgetall.mockResolvedValue({});

      const result = await repository.findByCode('NONEXIST');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update game state in Redis', async () => {
      const game: GameState = {
        gameCode: 'ABC123',
        board: new Board(),
        currentPlayer: 'O',
        status: 'playing',
        players: { X: 'conn-1', O: 'conn-2' },
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      };

      mockRedis.exists.mockResolvedValue(1);
      mockRedis.hset.mockResolvedValue(1);
      mockRedis.ttl.mockResolvedValue(3600);
      mockRedis.expire.mockResolvedValue(1);

      const result = await repository.update(game);

      expect(mockRedis.exists).toHaveBeenCalledWith('game:ABC123');
      expect(mockRedis.hset).toHaveBeenCalled();
      expect(mockRedis.ttl).toHaveBeenCalledWith('game:ABC123');
      expect(mockRedis.expire).toHaveBeenCalledWith('game:ABC123', 3600);
      expect(result.gameCode).toBe('ABC123');
    });

    it('should throw error if game does not exist', async () => {
      const game: GameState = {
        gameCode: 'NONEXIST',
        board: new Board(),
        currentPlayer: 'X',
        status: 'waiting',
        players: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRedis.exists.mockResolvedValue(0);

      await expect(repository.update(game)).rejects.toThrow(
        'Game not found: NONEXIST',
      );
    });
  });

  describe('exists', () => {
    it('should return true if game exists', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await repository.exists('ABC123');

      expect(mockRedis.exists).toHaveBeenCalledWith('game:ABC123');
      expect(result).toBe(true);
    });

    it('should return false if game does not exist', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await repository.exists('NONEXIST');

      expect(result).toBe(false);
    });
  });
});

