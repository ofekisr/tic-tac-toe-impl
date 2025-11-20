import { NestFactory } from '@nestjs/core';
import { AppModule } from './presentation/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.SERVER_PORT || process.env.PORT || 3001;
  const serverId = process.env.SERVER_ID || 'server-unknown';
  await app.listen(port);
  console.log(`Server ${serverId} is running on port ${port}`);
}

bootstrap();

