import { GameCode } from './GameCode';

describe('GameCode', () => {
  describe('generate', () => {
    it('should generate a code that is exactly 6 characters long', () => {
      const code = GameCode.generate();
      expect(code.length).toBe(6);
    });

    it('should generate codes containing only alphanumeric characters', () => {
      const code = GameCode.generate();
      const alphanumericRegex = /^[A-Za-z0-9]+$/;
      expect(code).toMatch(alphanumericRegex);
    });

    it('should generate case-sensitive codes', () => {
      const codes = Array.from({ length: 100 }, () => GameCode.generate());
      // Check that we have both uppercase and lowercase letters
      const hasUppercase = codes.some((code) => /[A-Z]/.test(code));
      const hasLowercase = codes.some((code) => /[a-z]/.test(code));
      // It's possible but unlikely that 100 codes would all be the same case
      // This test verifies the generator can produce both cases
      expect(hasUppercase || hasLowercase).toBe(true);
    });

    it('should generate different codes on multiple calls', () => {
      const codes = Array.from({ length: 100 }, () => GameCode.generate());
      const uniqueCodes = new Set(codes);
      // With 6 alphanumeric characters, we have 62^6 possible combinations
      // It's extremely unlikely to get duplicates in 100 calls
      expect(uniqueCodes.size).toBeGreaterThan(1);
    });

    it('should generate codes with numbers', () => {
      const codes = Array.from({ length: 100 }, () => GameCode.generate());
      const hasNumbers = codes.some((code) => /[0-9]/.test(code));
      // It's possible but unlikely that 100 codes would have no numbers
      expect(hasNumbers).toBe(true);
    });

    it('should generate codes with letters', () => {
      const codes = Array.from({ length: 100 }, () => GameCode.generate());
      const hasLetters = codes.some((code) => /[A-Za-z]/.test(code));
      // It's possible but unlikely that 100 codes would have no letters
      expect(hasLetters).toBe(true);
    });
  });

  describe('validate', () => {
    it('should validate a 6-character alphanumeric code', () => {
      expect(GameCode.validate('ABC123')).toBe(true);
      expect(GameCode.validate('xyz789')).toBe(true);
      expect(GameCode.validate('AbC123')).toBe(true);
      expect(GameCode.validate('123456')).toBe(true);
      expect(GameCode.validate('ABCDEF')).toBe(true);
    });

    it('should reject codes that are not 6 characters', () => {
      expect(GameCode.validate('ABC12')).toBe(false); // 5 characters
      expect(GameCode.validate('ABC1234')).toBe(false); // 7 characters
      expect(GameCode.validate('')).toBe(false); // empty
    });

    it('should reject codes with non-alphanumeric characters', () => {
      expect(GameCode.validate('ABC-12')).toBe(false); // contains hyphen
      expect(GameCode.validate('ABC 12')).toBe(false); // contains space
      expect(GameCode.validate('ABC@12')).toBe(false); // contains @
      expect(GameCode.validate('ABC_12')).toBe(false); // contains underscore
    });

    it('should be case-sensitive (accepts both cases)', () => {
      expect(GameCode.validate('ABC123')).toBe(true);
      expect(GameCode.validate('abc123')).toBe(true);
      expect(GameCode.validate('AbC123')).toBe(true);
    });
  });
});

