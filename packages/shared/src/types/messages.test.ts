import {
  isClientMessage,
  isServerMessage,
  JoinGameMessage,
  MakeMoveMessage,
  JoinedMessage,
  UpdateMessage,
  WinMessage,
  DrawMessage,
  ErrorMessage,
} from './messages';
import { ErrorCode } from './errors';

describe('isClientMessage', () => {
  it('should return true for valid JoinGameMessage', () => {
    // Arrange
    const message: JoinGameMessage = {
      type: 'join',
      gameCode: 'ABC123',
    };

    // Act
    const result = isClientMessage(message);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true for valid MakeMoveMessage', () => {
    // Arrange
    const message: MakeMoveMessage = {
      type: 'move',
      gameCode: 'ABC123',
      row: 1,
      col: 1,
    };

    // Act
    const result = isClientMessage(message);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false for null', () => {
    // Arrange
    const message = null;

    // Act
    const result = isClientMessage(message);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for non-object', () => {
    // Arrange
    const message = 'not an object';

    // Act
    const result = isClientMessage(message);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for object without type', () => {
    // Arrange
    const message = { gameCode: 'ABC123' };

    // Act
    const result = isClientMessage(message);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for invalid message type', () => {
    // Arrange
    const message = { type: 'invalid' };

    // Act
    const result = isClientMessage(message);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for join message without gameCode', () => {
    // Arrange
    const message = { type: 'join' };

    // Act
    const result = isClientMessage(message);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for move message with invalid row/col types', () => {
    // Arrange
    const message = {
      type: 'move',
      gameCode: 'ABC123',
      row: '1', // string instead of number
      col: 1,
    };

    // Act
    const result = isClientMessage(message);

    // Assert
    expect(result).toBe(false);
  });
});

describe('isServerMessage', () => {
  it('should return true for valid JoinedMessage', () => {
    // Arrange
    const message: JoinedMessage = {
      type: 'joined',
      gameCode: 'ABC123',
      board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      currentPlayer: 'X',
      status: 'waiting',
      playerSymbol: 'X',
    };

    // Act
    const result = isServerMessage(message);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true for valid UpdateMessage', () => {
    // Arrange
    const message: UpdateMessage = {
      type: 'update',
      gameCode: 'ABC123',
      board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      currentPlayer: 'X',
      status: 'playing',
    };

    // Act
    const result = isServerMessage(message);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true for valid WinMessage', () => {
    // Arrange
    const message: WinMessage = {
      type: 'win',
      gameCode: 'ABC123',
      board: [
        ['X', 'X', 'X'],
        ['', '', ''],
        ['', '', ''],
      ],
      winner: 'X',
    };

    // Act
    const result = isServerMessage(message);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true for valid DrawMessage', () => {
    // Arrange
    const message: DrawMessage = {
      type: 'draw',
      gameCode: 'ABC123',
      board: [
        ['X', 'O', 'X'],
        ['O', 'X', 'O'],
        ['O', 'X', 'O'],
      ],
    };

    // Act
    const result = isServerMessage(message);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true for valid ErrorMessage', () => {
    // Arrange
    const message: ErrorMessage = {
      type: 'error',
      code: ErrorCode.GAME_NOT_FOUND,
      message: 'Game not found',
    };

    // Act
    const result = isServerMessage(message);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false for null', () => {
    // Arrange
    const message = null;

    // Act
    const result = isServerMessage(message);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for non-object', () => {
    // Arrange
    const message = 'not an object';

    // Act
    const result = isServerMessage(message);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for object without type', () => {
    // Arrange
    const message = { gameCode: 'ABC123' };

    // Act
    const result = isServerMessage(message);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for invalid message type', () => {
    // Arrange
    const message = { type: 'invalid' };

    // Act
    const result = isServerMessage(message);

    // Assert
    expect(result).toBe(false);
  });
});

