import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WILSON_JWT_SECRET } from 'src/common/constants/constants';
import { User } from '../users/entities/user.entity';
import TwilioSmsService from './services/twilio.service';

@Module({
  providers: [TwilioSmsService],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(WILSON_JWT_SECRET),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
  ],
})
export class TwilioModule {}
