import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { GameModule } from './game.module';
import { WebSocket } from 'ws';

describe('GameGateway', () => {
  let module: TestingModule;
  let gateway: GameGateway;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [GameModule],
    }).compile();

    gateway = module.get<GameGateway>(GameGateway);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle connection', () => {
    const mockClient = {
      readyState: 1,
    } as unknown as WebSocket;

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    gateway.handleConnection(mockClient);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Client connected:'),
    );
    consoleSpy.mockRestore();
  });

  it('should handle disconnection', () => {
    const mockClient = {
      readyState: 1,
    } as unknown as WebSocket;

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    gateway.handleDisconnect(mockClient);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Client disconnected:'),
    );
    consoleSpy.mockRestore();
  });

  it('should have message handler structure', () => {
    const mockClient = {
      readyState: 1,
    } as unknown as WebSocket;

    const mockPayload = { type: 'test' };
    // Verify the method exists and can be called without error
    expect(() => gateway.handleMessage(mockClient, mockPayload)).not.toThrow();
  });
});

