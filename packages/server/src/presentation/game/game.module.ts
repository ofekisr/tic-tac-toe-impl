import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { ConnectionManager } from '../../application/services/ConnectionManager';
import { UpdateGameOnDisconnectionUseCase } from '../../application/use-cases/UpdateGameOnDisconnectionUseCase';
import { CreateGameUseCase } from '../../application/use-cases/CreateGameUseCase';
import { GameService } from '../../application/services/GameService';
import { RedisGameRepository } from '../../infrastructure/redis/redis-game.repository';

/**
 * GameModule provides WebSocket gateway and game-related services.
 * 
 * Uses RedisGameRepository for game state persistence.
 */
@Module({
  providers: [
    GameGateway,
    ConnectionManager,
    GameService,
    CreateGameUseCase,
    UpdateGameOnDisconnectionUseCase,
    {
      provide: 'IGameRepository',
      useClass: RedisGameRepository,
    },
  ],
})
export class GameModule {}

