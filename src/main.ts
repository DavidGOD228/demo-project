import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(morgan('dev'));

  const configService = app.get<ConfigService>(ConfigService);

  const logger = configService.get<string>('WILSON_BE_LOGGING', 'off');
  if (logger === 'on') {
    app.useGlobalInterceptors(new LoggingInterceptor());
  }

  const options = new DocumentBuilder()
    .setTitle('WILSON')
    .setDescription('Backend Application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('WILSON_BE_PORT', 8080);
  await app.listen(port);
}
bootstrap();
