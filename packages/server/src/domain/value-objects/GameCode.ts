/**
 * GameCode value object for generating and validating unique game codes.
 * 
 * Game codes are 6-character alphanumeric strings (A-Z, a-z, 0-9) that are
 * case-sensitive and used to identify and join specific game sessions.
 */
export class GameCode {
  private static readonly CODE_LENGTH = 6;
  private static readonly ALPHANUMERIC_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  /**
   * Generates a random 6-character alphanumeric game code.
   * Uses crypto.randomBytes for cryptographically secure random generation.
   * 
   * @returns A 6-character alphanumeric string
   */
  static generate(): string {
    const crypto = require('crypto');
    const randomBytes = crypto.randomBytes(this.CODE_LENGTH);
    let code = '';

    for (let i = 0; i < this.CODE_LENGTH; i++) {
      const randomIndex = randomBytes[i] % this.ALPHANUMERIC_CHARS.length;
      code += this.ALPHANUMERIC_CHARS[randomIndex];
    }

    return code;
  }

  /**
   * Validates that a string is a valid game code format.
   * 
   * @param code - The code to validate
   * @returns true if the code is exactly 6 alphanumeric characters, false otherwise
   */
  static validate(code: string): boolean {
    if (typeof code !== 'string') {
      return false;
    }

    if (code.length !== this.CODE_LENGTH) {
      return false;
    }

    const alphanumericRegex = /^[A-Za-z0-9]+$/;
    return alphanumericRegex.test(code);
  }
}

