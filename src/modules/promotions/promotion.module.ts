import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileService } from '../aws/services/file.service';
import { User } from '../users/entities/user.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { Promotion } from './entities/promotion.entity';
import { PromotionsService } from './services/promotions.service';
import { PromotionsController } from './controllers/promotions.controller';
import { EmailsModule } from '../emails/emails.module';
import { UserModule } from '../users/user.module';
import { UsersPromotion } from '../users/entities/usersPromotions.entity';
import { ExportCsvService } from '../config/services/csvExport.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    EmailsModule,
    FirebaseModule,
    UserModule,
    TypeOrmModule.forFeature([Promotion, Widget, User, UsersPromotion]),
  ],
  providers: [PromotionsService, FileService, ExportCsvService],
  controllers: [PromotionsController],
  exports: [PromotionsService],
})
export class PromotionModule {}
