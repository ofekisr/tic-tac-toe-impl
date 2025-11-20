import { ErrorCode } from '@fusion-tic-tac-toe/shared';

/**
 * ValidationResult represents the result of a validation operation.
 * 
 * If isValid is true, the validation passed.
 * If isValid is false, errorCode contains the specific error code.
 */
export interface ValidationResult {
  isValid: boolean;
  errorCode?: ErrorCode;
  message?: string;
}

