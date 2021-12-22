import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../channels/entities/channel.entity';
import { ScanController } from './controllers/scan.controller';
import { Scan } from './entities/scan.entity';
import { ScanService } from './services/scan.service';
import { Widget } from '../widgets/entities/widget.entity';
import { User } from '../users/entities/user.entity';

@Module({
  controllers: [ScanController],
  providers: [ScanService],
  imports: [TypeOrmModule.forFeature([Scan, Channel, User, Widget])],
})
export class ScanModule {}
