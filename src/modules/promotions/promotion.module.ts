import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileService } from '../aws/services/file.service';
import { User } from '../users/entities/user.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { Promotion } from './entities/promotion.entity';
import { PromotionsService } from './services/promotions.service';
import { PromotionsController } from './controllers/promotions.controller';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [EmailsModule, TypeOrmModule.forFeature([Promotion, Widget, User])],
  providers: [PromotionsService, FileService],
  controllers: [PromotionsController],
})
export class PromotionModule {}
