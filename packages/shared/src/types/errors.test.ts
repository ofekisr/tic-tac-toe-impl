import { ErrorCode, GameError } from './errors';

describe('ErrorCode', () => {
  it('should have all required error codes', () => {
    // Assert
    expect(ErrorCode.INVALID_MESSAGE).toBe('INVALID_MESSAGE');
    expect(ErrorCode.GAME_NOT_FOUND).toBe('GAME_NOT_FOUND');
    expect(ErrorCode.GAME_FULL).toBe('GAME_FULL');
    expect(ErrorCode.INVALID_MOVE).toBe('INVALID_MOVE');
    expect(ErrorCode.NOT_YOUR_TURN).toBe('NOT_YOUR_TURN');
    expect(ErrorCode.CELL_OCCUPIED).toBe('CELL_OCCUPIED');
    expect(ErrorCode.INVALID_POSITION).toBe('INVALID_POSITION');
    expect(ErrorCode.GAME_ALREADY_FINISHED).toBe('GAME_ALREADY_FINISHED');
    expect(ErrorCode.CONNECTION_ERROR).toBe('CONNECTION_ERROR');
    expect(ErrorCode.SERVER_ERROR).toBe('SERVER_ERROR');
  });

  it('should have correct number of error codes', () => {
    // Act
    const errorCodes = Object.values(ErrorCode);

    // Assert
    expect(errorCodes.length).toBe(10);
  });
});

describe('GameError', () => {
  it('should create error with required fields', () => {
    // Arrange & Act
    const error: GameError = {
      code: ErrorCode.GAME_NOT_FOUND,
      message: 'Game not found',
    };

    // Assert
    expect(error.code).toBe(ErrorCode.GAME_NOT_FOUND);
    expect(error.message).toBe('Game not found');
    expect(error.details).toBeUndefined();
  });

  it('should create error with optional details', () => {
    // Arrange & Act
    const error: GameError = {
      code: ErrorCode.INVALID_MOVE,
      message: 'Invalid move',
      details: { row: 5, col: 5 },
    };

    // Assert
    expect(error.code).toBe(ErrorCode.INVALID_MOVE);
    expect(error.message).toBe('Invalid move');
    expect(error.details).toEqual({ row: 5, col: 5 });
  });
});

