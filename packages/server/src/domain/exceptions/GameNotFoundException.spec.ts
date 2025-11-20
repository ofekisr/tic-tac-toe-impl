import { GameNotFoundException } from './GameNotFoundException';

describe('GameNotFoundException', () => {
  it('should create exception with game code', () => {
    const exception = new GameNotFoundException('ABC123');

    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(GameNotFoundException);
    expect(exception.gameCode).toBe('ABC123');
    expect(exception.message).toBe("Game code 'ABC123' does not exist");
    expect(exception.name).toBe('GameNotFoundException');
  });

  it('should create exception with different game code', () => {
    const exception = new GameNotFoundException('XYZ789');

    expect(exception.gameCode).toBe('XYZ789');
    expect(exception.message).toBe("Game code 'XYZ789' does not exist");
  });
});

