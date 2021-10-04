import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scan } from '../scans/entities/scan.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { Channel } from './entities/channel.entity';
import { ChannelService } from './services/channel.service';
import { ChannelController } from './controllers/channel.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Scan, Widget])],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
