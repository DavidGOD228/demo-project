import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ExportCsvService } from '../config/services/csvExport.service';
import { Interest } from '../interests/entities/interest.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { FileService } from '../aws/services/file.service';
import { UserService } from './services/user.service';
import { EmailsModule } from '../emails/emails.module';
import { Promotion } from '../promotions/entities/promotion.entity';
import { Channel } from '../channels/entities/channel.entity';
import { UsersPromotion } from './entities/usersPromotions.entity';
import { MAX_FILE_SIZE, WILSON_JWT_SECRET } from '../../common/constants/constants';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [UserController],
  providers: [UserService, FileService, ExportCsvService],
  exports: [UserService],
  imports: [
    EmailsModule,
    MulterModule.register({
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(WILSON_JWT_SECRET),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UsersPromotion, Interest, Widget, Scan, Promotion, Channel]),
  ],
})
export class UserModule {}
