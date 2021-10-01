import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileService } from '../aws/services/file.service';
import { User } from '../users/entities/user.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { PromotionController } from './controllers/promotion.controller';
import { Promotion } from './entities/promotion.entity';
import { PromotionService } from './services/promotion.service';

@Module({
  controllers: [PromotionController],
  providers: [PromotionService, FileService],
  imports: [TypeOrmModule.forFeature([Promotion, Widget, User])],
})
export class PromotionModule {}
