import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../channels/entities/channel.entity';
import { Scan } from './entities/scan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scan, Channel])],
})
export class ScanModule {}
