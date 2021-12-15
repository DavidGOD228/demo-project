import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileService } from '../aws/services/file.service';
import { Channel } from '../channels/entities/channel.entity';
import { ExportCsvService } from '../config/services/csvExport.service';
import { Promotion } from '../promotions/entities/promotion.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { WidgetController } from './controllers/widget.controller';
import { StoryBlock } from './entities/storyBlock.entity';
import { Widget } from './entities/widget.entity';
import { WidgetService } from './services/widget.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { UsersPromotion } from '../users/entities/usersPromotions.entity';

@Module({
  controllers: [WidgetController],
  providers: [WidgetService, FileService, ExportCsvService],
  imports: [
    FirebaseModule,
    TypeOrmModule.forFeature([StoryBlock, Widget, Tag, User, Scan, Channel, Promotion, UsersPromotion]),
  ],
})
export class WidgetModule {}
