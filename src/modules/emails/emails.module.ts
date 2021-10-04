import { Module } from '@nestjs/common';
import { MailService } from '@sendgrid/mail';
import { EmailsService } from './services/emails.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailTemplate } from './entities/mailTemplate.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MailTemplate, User])],
  providers: [EmailsService, MailService],
  exports: [EmailsService, MailService],
})
export class EmailsModule {}
