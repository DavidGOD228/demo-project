import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scan } from '../scans/entities/scan.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { Channel } from './entities/channel.entity';
import { ChannelService } from './services/channel.service';
import { ChannelController } from './controllers/channel.controller';
import { FileService } from '../aws/services/file.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Scan, Widget, User])],
  controllers: [ChannelController],
  providers: [ChannelService, FileService],
})
export class ChannelModule {}
