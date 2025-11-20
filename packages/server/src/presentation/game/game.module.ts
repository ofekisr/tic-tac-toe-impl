import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { ConnectionManager } from '../../application/services/ConnectionManager';
import { UpdateGameOnDisconnectionUseCase } from '../../application/use-cases/UpdateGameOnDisconnectionUseCase';
import { CreateGameUseCase } from '../../application/use-cases/CreateGameUseCase';
import { JoinGameUseCase } from '../../application/use-cases/JoinGameUseCase';
import { MakeMoveUseCase } from '../../application/use-cases/MakeMoveUseCase';
import { GameService } from '../../application/services/GameService';
import { MessageValidator } from '../../application/services/MessageValidator';
import { MoveValidationService } from '../../application/services/MoveValidationService';
import { GameStateService } from '../../application/services/GameStateService';
import { GameSyncService } from '../../application/services/GameSyncService';
import { GameSyncSubscriptionService } from '../../application/services/GameSyncSubscriptionService';
import { SyncGameStateUseCase } from '../../application/use-cases/SyncGameStateUseCase';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { RedisGameRepository } from '../../infrastructure/redis/redis-game.repository';

/**
 * GameModule provides WebSocket gateway and game-related services.
 * 
 * Uses RedisGameRepository for game state persistence.
 */
@Module({
  imports: [RedisModule],
  providers: [
    GameGateway,
    ConnectionManager,
    GameService,
    MessageValidator,
    MoveValidationService,
    GameStateService,
    GameSyncService,
    SyncGameStateUseCase,
    GameSyncSubscriptionService,
    CreateGameUseCase,
    JoinGameUseCase,
    MakeMoveUseCase,
    UpdateGameOnDisconnectionUseCase,
    {
      provide: 'IGameRepository',
      useClass: RedisGameRepository,
    },
  ],
})
export class GameModule {}

