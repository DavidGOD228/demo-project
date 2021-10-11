import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  controllers: [UserController],
  providers: [UserService, FileService, ExportCsvService],
  exports: [UserService],
  imports: [EmailsModule, TypeOrmModule.forFeature([User, UsersPromotion, Interest, Widget, Scan, Promotion, Channel])],
})
export class UserModule {}
