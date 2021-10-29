import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { config as awsConfig } from 'aws-sdk';
import { config } from 'dotenv';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors';
import * as constants from './common/constants/constants';

config({ path: `.env.${process.env.NODE_ENV}` });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['https://dev-cms.wilsonlive.app', 'https://cms.wilsonlive.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    maxAge: 86400,
  });
  app.use(morgan('dev'));

  const configService = app.get<ConfigService>(ConfigService);

  const logger = configService.get<string>(constants.WILSON_BE_LOGGING, 'off');

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

  awsConfig.update({
    accessKeyId: configService.get<string>(constants.WILSON_AWS_ACCESS_KEY_ID),
    secretAccessKey: configService.get<string>(constants.WILSON_AWS_SECRET_ACCESS_KEY),
    region: configService.get<string>(constants.WILSON_AWS_REGION),
  });

  Sentry.init({
    dsn: configService.get<string>(constants.WILSON_SENTRY_DSN),
    environment: configService.get<string>(constants.WILSON_SENTRY_ENVIRONMENT),
  });

  const port = configService.get<number>(constants.WILSON_BE_PORT, 8080);

  await app.listen(port);
}

bootstrap();
