import { Game } from './Game';
import { Board, BoardCell } from '@fusion-tic-tac-toe/shared';

describe('Game', () => {
  describe('constructor', () => {
    it('should create a game with default initial state', () => {
      const game = new Game('ABC123');

      expect(game.gameCode).toBe('ABC123');
      expect(game.board).toBeInstanceOf(Board);
      expect(game.currentPlayer).toBe('X');
      expect(game.status).toBe('waiting');
      expect(game.winner).toBeNull();
      expect(game.players).toEqual({});
      expect(game.createdAt).toBeInstanceOf(Date);
      expect(game.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a game with empty 3x3 board', () => {
      const game = new Game('ABC123');
      const boardArray = game.board.toArray();

      expect(boardArray).toHaveLength(3);
      expect(boardArray[0]).toEqual(['', '', '']);
      expect(boardArray[1]).toEqual(['', '', '']);
      expect(boardArray[2]).toEqual(['', '', '']);
    });

    it('should create a game with provided board', () => {
      const customBoard = new Board([
        ['X', 'O', ''],
        ['', 'X', ''],
        ['', '', 'O'],
      ]);
      const game = new Game('ABC123', customBoard);

      expect(game.board).toBe(customBoard);
    });

    it('should create a game with provided properties', () => {
      const board = new Board();
      const players = { X: 'conn-1', O: 'conn-2' };
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');

      const game = new Game(
        'ABC123',
        board,
        'O',
        'playing',
        null,
        players,
        createdAt,
        updatedAt,
      );

      expect(game.gameCode).toBe('ABC123');
      expect(game.board).toBe(board);
      expect(game.currentPlayer).toBe('O');
      expect(game.status).toBe('playing');
      expect(game.winner).toBeNull();
      expect(game.players).toEqual(players);
      expect(game.createdAt).toBe(createdAt);
      expect(game.updatedAt).toBe(updatedAt);
    });
  });

  describe('toDTO', () => {
    it('should convert Game to GameState DTO', () => {
      const board = new Board();
      const players = { X: 'conn-1', O: 'conn-2' };
      const game = new Game('ABC123', board, 'X', 'waiting', null, players);

      const dto = game.toDTO();

      expect(dto.gameCode).toBe('ABC123');
      expect(dto.board).toBe(board);
      expect(dto.currentPlayer).toBe('X');
      expect(dto.status).toBe('waiting');
      expect(dto.winner).toBeUndefined();
      expect(dto.players).toEqual(players);
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });

    it('should convert Game with winner to DTO', () => {
      const game = new Game('ABC123', new Board(), 'X', 'finished', 'X');

      const dto = game.toDTO();

      expect(dto.winner).toBe('X');
      expect(dto.status).toBe('finished');
    });
  });

  describe('fromDTO', () => {
    it('should create Game from GameState DTO', () => {
      const board = new Board();
      const players = { X: 'conn-1' };
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');

      const gameState = {
        gameCode: 'ABC123',
        board,
        currentPlayer: 'X' as const,
        status: 'waiting' as const,
        winner: undefined,
        players,
        createdAt,
        updatedAt,
      };

      const game = Game.fromDTO(gameState);

      expect(game.gameCode).toBe('ABC123');
      expect(game.board).toBe(board);
      expect(game.currentPlayer).toBe('X');
      expect(game.status).toBe('waiting');
      expect(game.winner).toBeNull();
      expect(game.players).toEqual(players);
      expect(game.createdAt).toBe(createdAt);
      expect(game.updatedAt).toBe(updatedAt);
    });

    it('should create Game from DTO with winner', () => {
      const gameState = {
        gameCode: 'ABC123',
        board: new Board(),
        currentPlayer: 'X' as const,
        status: 'finished' as const,
        winner: 'X' as const,
        players: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const game = Game.fromDTO(gameState);

      expect(game.winner).toBe('X');
      expect(game.status).toBe('finished');
    });
  });
});

