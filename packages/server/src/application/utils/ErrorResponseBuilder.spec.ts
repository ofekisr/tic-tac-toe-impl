import { ErrorResponseBuilder } from './ErrorResponseBuilder';
import { ErrorCode, ErrorMessage } from '@fusion-tic-tac-toe/shared';

describe('ErrorResponseBuilder', () => {
  describe('buildErrorResponse', () => {
    it('should build error response with code and message', () => {
      const error = ErrorResponseBuilder.buildErrorResponse(
        ErrorCode.INVALID_MESSAGE,
        'Invalid message format',
      );

      expect(error).toEqual({
        type: 'error',
        code: ErrorCode.INVALID_MESSAGE,
        message: 'Invalid message format',
      });
    });

    it('should build error response with details', () => {
      const details = { field: 'gameCode', value: null };
      const error = ErrorResponseBuilder.buildErrorResponse(
        ErrorCode.INVALID_MESSAGE,
        'Missing required field',
        details,
      );

      expect(error).toEqual({
        type: 'error',
        code: ErrorCode.INVALID_MESSAGE,
        message: 'Missing required field',
        details,
      });
    });

    it('should build GAME_NOT_FOUND error', () => {
      const error = ErrorResponseBuilder.buildErrorResponse(
        ErrorCode.GAME_NOT_FOUND,
        "Game code 'ABC123' does not exist",
      );

      expect(error.type).toBe('error');
      expect(error.code).toBe(ErrorCode.GAME_NOT_FOUND);
      expect(error.message).toBe("Game code 'ABC123' does not exist");
    });

    it('should build INVALID_MESSAGE error', () => {
      const error = ErrorResponseBuilder.buildErrorResponse(
        ErrorCode.INVALID_MESSAGE,
        'Missing required field: gameCode',
      );

      expect(error.type).toBe('error');
      expect(error.code).toBe(ErrorCode.INVALID_MESSAGE);
      expect(error.message).toBe('Missing required field: gameCode');
    });

    it('should build SERVER_ERROR error', () => {
      const error = ErrorResponseBuilder.buildErrorResponse(
        ErrorCode.SERVER_ERROR,
        'Internal server error',
        { stack: 'Error stack trace' },
      );

      expect(error.type).toBe('error');
      expect(error.code).toBe(ErrorCode.SERVER_ERROR);
      expect(error.message).toBe('Internal server error');
      expect(error.details).toEqual({ stack: 'Error stack trace' });
    });

    it('should return ErrorMessage type', () => {
      const error = ErrorResponseBuilder.buildErrorResponse(
        ErrorCode.INVALID_MESSAGE,
        'Test message',
      );

      // TypeScript compile-time check - if this compiles, type is correct
      const errorMessage: ErrorMessage = error;
      expect(errorMessage.type).toBe('error');
    });
  });
});

