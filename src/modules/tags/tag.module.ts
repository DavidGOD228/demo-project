import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from '../widgets/entities/widget.entity';
import { TagsController } from './controllers/tag.controller';
import { Tag } from './entities/tag.entity';
import { TagsService } from './services/tag.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService],
  imports: [TypeOrmModule.forFeature([Tag, Widget])],
})
export class TagModule {}
