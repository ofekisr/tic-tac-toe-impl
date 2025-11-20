import { ConnectionManager } from './ConnectionManager';

describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager;

  beforeEach(() => {
    connectionManager = new ConnectionManager();
  });

  describe('registerConnection', () => {
    it('should register a connection with game code and player symbol', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'X');

      expect(connectionManager.getGameCode('conn1')).toBe('ABC123');
      expect(connectionManager.getPlayerSymbol('conn1')).toBe('X');
    });

    it('should allow multiple connections for the same game', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'X');
      connectionManager.registerConnection('conn2', 'ABC123', 'O');

      const connections = connectionManager.getConnectionsByGameCode('ABC123');
      expect(connections).toContain('conn1');
      expect(connections).toContain('conn2');
      expect(connections.length).toBe(2);
    });

    it('should update connection if re-registered with different game', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'X');
      connectionManager.registerConnection('conn1', 'XYZ789', 'O');

      expect(connectionManager.getGameCode('conn1')).toBe('XYZ789');
      expect(connectionManager.getPlayerSymbol('conn1')).toBe('O');
      expect(connectionManager.getConnectionsByGameCode('ABC123')).not.toContain('conn1');
      expect(connectionManager.getConnectionsByGameCode('XYZ789')).toContain('conn1');
    });
  });

  describe('getGameCode', () => {
    it('should return game code for registered connection', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'X');
      expect(connectionManager.getGameCode('conn1')).toBe('ABC123');
    });

    it('should return undefined for unregistered connection', () => {
      expect(connectionManager.getGameCode('unknown')).toBeUndefined();
    });
  });

  describe('getPlayerSymbol', () => {
    it('should return player symbol for registered connection', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'O');
      expect(connectionManager.getPlayerSymbol('conn1')).toBe('O');
    });

    it('should return undefined for unregistered connection', () => {
      expect(connectionManager.getPlayerSymbol('unknown')).toBeUndefined();
    });
  });

  describe('removeConnection', () => {
    it('should remove connection from all mappings', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'X');
      connectionManager.removeConnection('conn1');

      expect(connectionManager.getGameCode('conn1')).toBeUndefined();
      expect(connectionManager.getPlayerSymbol('conn1')).toBeUndefined();
      expect(connectionManager.getConnectionsByGameCode('ABC123')).not.toContain('conn1');
    });

    it('should clean up empty game entry when last connection removed', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'X');
      connectionManager.removeConnection('conn1');

      expect(connectionManager.getConnectionsByGameCode('ABC123')).toEqual([]);
    });

    it('should not affect other connections in the same game', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'X');
      connectionManager.registerConnection('conn2', 'ABC123', 'O');
      connectionManager.removeConnection('conn1');

      expect(connectionManager.getGameCode('conn2')).toBe('ABC123');
      expect(connectionManager.getConnectionsByGameCode('ABC123')).toContain('conn2');
      expect(connectionManager.getConnectionsByGameCode('ABC123')).not.toContain('conn1');
    });
  });

  describe('getConnectionsByGameCode', () => {
    it('should return all connection IDs for a game', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'X');
      connectionManager.registerConnection('conn2', 'ABC123', 'O');
      connectionManager.registerConnection('conn3', 'XYZ789', 'X');

      const connections = connectionManager.getConnectionsByGameCode('ABC123');
      expect(connections).toHaveLength(2);
      expect(connections).toContain('conn1');
      expect(connections).toContain('conn2');
    });

    it('should return empty array for game with no connections', () => {
      expect(connectionManager.getConnectionsByGameCode('UNKNOWN')).toEqual([]);
    });
  });

  describe('removeConnectionFromGame', () => {
    it('should remove connection if it matches the game code', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'X');
      connectionManager.removeConnectionFromGame('conn1', 'ABC123');

      expect(connectionManager.getGameCode('conn1')).toBeUndefined();
    });

    it('should not remove connection if game code does not match', () => {
      connectionManager.registerConnection('conn1', 'ABC123', 'X');
      connectionManager.removeConnectionFromGame('conn1', 'XYZ789');

      expect(connectionManager.getGameCode('conn1')).toBe('ABC123');
    });

    it('should not remove connection if connection is not registered', () => {
      expect(() => {
        connectionManager.removeConnectionFromGame('unknown', 'ABC123');
      }).not.toThrow();
    });
  });
});

