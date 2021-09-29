import { ConfigModule, ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { types } from 'pg';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { IDbProps } from './interfaces';

const parser = (value: string): Date => {
  return moment.utc(value).toDate();
};

export const ormconfig = {
  imports: [ConfigModule],
  useFactory: (): IDbProps => {
    const configService = new ConfigService();

    types.setTypeParser(types.builtins.DATE, parser);

    return {
      type: 'postgres',
      host: configService.get<string>('WILSON_DB_HOST', 'localhost'),
      port: configService.get<number>('WILSON_DB_PORT', 5432),
      username: configService.get<string>('WILSON_DB_USERNAME', 'Admin'),
      password: configService.get<string>('WILSON_DB_PASSWORD', 'wilson'),
      database: configService.get<string>('WILSON_DB_DBNAME', 'wilson'),
      entities: [__dirname + '../../**/*.entity{.ts,.js}'],
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
      logging: false,
    };
  },
};
