import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const configService = app.get<ConfigService>(ConfigService);

  const port = configService.get<number>('WILSON_BE_PORT', 8080);
  await app.listen(port);
}
bootstrap();
