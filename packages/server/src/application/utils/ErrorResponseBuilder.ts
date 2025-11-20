import { ErrorCode, ErrorMessage } from '@fusion-tic-tac-toe/shared';

/**
 * ErrorResponseBuilder utility for creating standardized error messages.
 * 
 * Provides a consistent way to build error responses that match the
 * ErrorMessage type from the shared package.
 */
export class ErrorResponseBuilder {
  /**
   * Build an error response message.
   * 
   * @param code - Error code from ErrorCode enum
   * @param message - User-friendly error message
   * @param details - Optional additional details for debugging
   * @returns ErrorMessage object ready to send to client
   */
  static buildErrorResponse(
    code: ErrorCode,
    message: string,
    details?: unknown,
  ): ErrorMessage {
    const errorMessage: ErrorMessage = {
      type: 'error',
      code,
      message,
    };

    if (details !== undefined) {
      errorMessage.details = details;
    }

    return errorMessage;
  }
}

