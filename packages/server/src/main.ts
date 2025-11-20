import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './presentation/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  const port = process.env.SERVER_PORT || process.env.PORT || 3001;
  const serverId = process.env.SERVER_ID || 'server-unknown';
  await app.listen(port);
  console.log(`Server ${serverId} is running on port ${port}`);
}

bootstrap();

