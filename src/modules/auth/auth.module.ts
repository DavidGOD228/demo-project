import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WILSON_JWT_SECRET } from 'src/common/constants/constants';
import TwilioSmsService from '../twilio/services/twilio.service';
import { User } from '../users/entities/user.entity';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailsModule } from '../emails/emails.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TwilioSmsService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(WILSON_JWT_SECRET),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AuthModule {}
