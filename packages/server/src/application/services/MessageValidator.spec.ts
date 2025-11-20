import { MessageValidator } from './MessageValidator';
import { JoinGameMessage, MakeMoveMessage } from '@fusion-tic-tac-toe/shared';

describe('MessageValidator', () => {
  let validator: MessageValidator;

  beforeEach(() => {
    validator = new MessageValidator();
  });

  describe('validateMessage', () => {
    it('should validate valid JoinGameMessage', () => {
      const message: JoinGameMessage = {
        type: 'join',
        gameCode: 'ABC123',
      };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.message).toStrictEqual(message);
    });

    it('should validate valid MakeMoveMessage', () => {
      const message: MakeMoveMessage = {
        type: 'move',
        gameCode: 'ABC123',
        row: 1,
        col: 2,
      };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.message).toStrictEqual(message);
    });

    it('should parse JSON string and validate', () => {
      const message: JoinGameMessage = {
        type: 'join',
        gameCode: 'ABC123',
      };
      const jsonString = JSON.stringify(message);

      const result = validator.validateMessage(jsonString);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.message).toEqual(message);
    });

    it('should reject invalid JSON string', () => {
      const invalidJson = '{ type: "join", gameCode: }';

      const result = validator.validateMessage(invalidJson);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Invalid JSON');
      expect(result.message).toBeUndefined();
    });

    it('should reject message without type field', () => {
      const message = { gameCode: 'ABC123' };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Missing required field: type');
      expect(result.message).toBeUndefined();
    });

    it('should reject unrecognized message type', () => {
      const message = { type: 'unknown', gameCode: 'ABC123' };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Unrecognized message type');
      expect(result.message).toBeUndefined();
    });

    it('should reject JoinGameMessage without gameCode', () => {
      const message = { type: 'join' };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Missing required field: gameCode');
      expect(result.message).toBeUndefined();
    });

    it('should reject JoinGameMessage with non-string gameCode', () => {
      const message = { type: 'join', gameCode: 123 };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Invalid field type: gameCode must be string');
      expect(result.message).toBeUndefined();
    });

    it('should reject MakeMoveMessage without gameCode', () => {
      const message = { type: 'move', row: 1, col: 2 };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Missing required field: gameCode');
      expect(result.message).toBeUndefined();
    });

    it('should reject MakeMoveMessage without row', () => {
      const message = { type: 'move', gameCode: 'ABC123', col: 2 };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Missing required field: row');
      expect(result.message).toBeUndefined();
    });

    it('should reject MakeMoveMessage without col', () => {
      const message = { type: 'move', gameCode: 'ABC123', row: 1 };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Missing required field: col');
      expect(result.message).toBeUndefined();
    });

    it('should reject MakeMoveMessage with non-number row', () => {
      const message = { type: 'move', gameCode: 'ABC123', row: '1', col: 2 };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Invalid field type: row must be number');
      expect(result.message).toBeUndefined();
    });

    it('should reject MakeMoveMessage with non-number col', () => {
      const message = { type: 'move', gameCode: 'ABC123', row: 1, col: '2' };

      const result = validator.validateMessage(message);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Invalid field type: col must be number');
      expect(result.message).toBeUndefined();
    });

    it('should reject null message', () => {
      const result = validator.validateMessage(null);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Message cannot be null or undefined');
    });

    it('should reject undefined message', () => {
      const result = validator.validateMessage(undefined);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Message cannot be null or undefined');
    });

    it('should reject non-object message', () => {
      const result = validator.validateMessage(123);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_MESSAGE');
      expect(result.error?.message).toContain('Message must be an object');
    });
  });
});

