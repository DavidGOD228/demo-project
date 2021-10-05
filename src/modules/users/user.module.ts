import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportCsvService } from '../config/services/csvExport.service';
import { Interest } from '../interests/entities/interest.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { FileService } from './services/file.service';
import { UserService } from './services/user.service';
import { EmailsModule } from '../emails/emails.module';

@Module({
  controllers: [UserController],
  providers: [UserService, FileService, ExportCsvService],
  imports: [EmailsModule, TypeOrmModule.forFeature([User, Interest, Widget, Scan])],
})
export class UserModule {}
