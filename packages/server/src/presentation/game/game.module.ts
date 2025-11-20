import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { ConnectionManager } from '../../application/services/ConnectionManager';
import { UpdateGameOnDisconnectionUseCase } from '../../application/use-cases/UpdateGameOnDisconnectionUseCase';
import { InMemoryGameRepository } from '../../infrastructure/mocks/in-memory-game.repository';

/**
 * GameModule provides WebSocket gateway and game-related services.
 * 
 * Note: Currently uses InMemoryGameRepository as a temporary implementation
 * until Redis integration is completed (Epic 4). The Redis implementation
 * will replace this in-memory repository.
 */
@Module({
  providers: [
    GameGateway,
    ConnectionManager,
    UpdateGameOnDisconnectionUseCase,
    {
      provide: 'IGameRepository',
      useClass: InMemoryGameRepository,
    },
  ],
})
export class GameModule {}

