import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from '../widgets/entities/widget.entity';
import { Promotion } from './entities/promotion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, Widget])],
})
export class PromotionModule {}
