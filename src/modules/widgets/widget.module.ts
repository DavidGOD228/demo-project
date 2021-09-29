import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../channels/entities/channel.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { WidgetController } from './controllers/widget.controller';
import { StoryBlock } from './entities/storyBlock.entity';
import { Widget } from './entities/widget.entity';
import { WidgetService } from './services/widget.service';

@Module({
  controllers: [WidgetController],
  providers: [WidgetService],
  imports: [TypeOrmModule.forFeature([StoryBlock, Widget, Tag, User, Scan, Channel])],
})
export class WidgetModule {}
