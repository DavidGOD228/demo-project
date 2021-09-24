import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../channels/entities/channel.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { StoryBlock } from './entities/storyBlock.entity';
import { Widget } from './entities/widget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoryBlock, Widget, Tag, User, Scan, Channel])],
})
export class WidgetModule {}
