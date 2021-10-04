import { Module } from '@nestjs/common';
import { RecognitionService } from './services/recognition.service';
import { RecognitionController } from './controllers/recognition.controller';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../channels/entities/channel.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { Scan } from '../scans/entities/scan.entity';
import { User } from '../users/entities/user.entity';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [EmailsModule, TypeOrmModule.forFeature([Channel, Widget, Scan, User])],
  providers: [RecognitionService, ConfigService],
  controllers: [RecognitionController],
  exports: [RecognitionService],
})
export class AwsModule {}
