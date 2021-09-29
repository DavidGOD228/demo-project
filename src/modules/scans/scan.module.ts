import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../channels/entities/channel.entity';
import { ScanController } from './controllers/scan.controller';
import { Scan } from './entities/scan.entity';
import { ScanService } from './services/scan.service';

@Module({
  controllers: [ScanController],
  providers: [ScanService],
  imports: [TypeOrmModule.forFeature([Scan, Channel])],
})
export class ScanModule {}
