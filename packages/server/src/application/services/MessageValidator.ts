import { Injectable } from '@nestjs/common';
import {
  JoinGameMessage,
  MakeMoveMessage,
  ClientMessage,
  ErrorCode,
} from '@fusion-tic-tac-toe/shared';

/**
 * Validation result for message validation.
 */
export interface ValidationResult {
  success: boolean;
  message?: ClientMessage;
  error?: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

/**
 * MessageValidator service validates incoming WebSocket messages.
 * 
 * Validates:
 * - Message is valid JSON (if string)
 * - Message has required `type` field
 * - Message type is recognized ('join' or 'move')
 * - Required fields are present based on message type
 * - Field types are correct
 */
@Injectable()
export class MessageValidator {
  /**
   * Validate an incoming message.
   * @param message - Raw message (object or JSON string)
   * @returns ValidationResult with success status and validated message or error
   */
  validateMessage(message: unknown): ValidationResult {
    // Handle null/undefined
    if (message === null || message === undefined) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Message cannot be null or undefined',
          details: message,
        },
      };
    }

    // Parse JSON string if needed
    let parsedMessage: unknown = message;
    if (typeof message === 'string') {
      try {
        parsedMessage = JSON.parse(message);
      } catch (error) {
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_MESSAGE,
            message: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
            details: message,
          },
        };
      }
    }

    // Check if message is an object
    if (typeof parsedMessage !== 'object' || parsedMessage === null) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Message must be an object',
          details: parsedMessage,
        },
      };
    }

    const msg = parsedMessage as Record<string, unknown>;

    // Check for type field
    if (!('type' in msg)) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Missing required field: type',
          details: msg,
        },
      };
    }

    const messageType = msg.type;

    // Check if type is recognized
    if (messageType !== 'join' && messageType !== 'move') {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: `Unrecognized message type: ${String(messageType)}. Expected 'join' or 'move'`,
          details: msg,
        },
      };
    }

    // Validate based on message type
    if (messageType === 'join') {
      return this.validateJoinMessage(msg);
    } else if (messageType === 'move') {
      return this.validateMoveMessage(msg);
    }

    // This should never be reached, but TypeScript needs it
    return {
      success: false,
      error: {
        code: ErrorCode.INVALID_MESSAGE,
        message: 'Unknown validation error',
        details: msg,
      },
    };
  }

  /**
   * Validate JoinGameMessage.
   */
  private validateJoinMessage(msg: Record<string, unknown>): ValidationResult {
    // Check gameCode field
    if (!('gameCode' in msg)) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Missing required field: gameCode',
          details: msg,
        },
      };
    }

    // Check gameCode type
    if (typeof msg.gameCode !== 'string') {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Invalid field type: gameCode must be string',
          details: msg,
        },
      };
    }

    const validatedMessage: JoinGameMessage = {
      type: 'join',
      gameCode: msg.gameCode,
    };

    return {
      success: true,
      message: validatedMessage,
    };
  }

  /**
   * Validate MakeMoveMessage.
   */
  private validateMoveMessage(msg: Record<string, unknown>): ValidationResult {
    // Check gameCode field
    if (!('gameCode' in msg)) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Missing required field: gameCode',
          details: msg,
        },
      };
    }

    // Check gameCode type
    if (typeof msg.gameCode !== 'string') {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Invalid field type: gameCode must be string',
          details: msg,
        },
      };
    }

    // Check row field
    if (!('row' in msg)) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Missing required field: row',
          details: msg,
        },
      };
    }

    // Check row type
    if (typeof msg.row !== 'number') {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Invalid field type: row must be number',
          details: msg,
        },
      };
    }

    // Check col field
    if (!('col' in msg)) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Missing required field: col',
          details: msg,
        },
      };
    }

    // Check col type
    if (typeof msg.col !== 'number') {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_MESSAGE,
          message: 'Invalid field type: col must be number',
          details: msg,
        },
      };
    }

    const validatedMessage: MakeMoveMessage = {
      type: 'move',
      gameCode: msg.gameCode,
      row: msg.row,
      col: msg.col,
    };

    return {
      success: true,
      message: validatedMessage,
    };
  }
}

