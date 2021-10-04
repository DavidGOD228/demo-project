import { BadRequestException, Injectable } from '@nestjs/common';
import { MailService } from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import * as constants from '../../../common/constants/constants';
import { MailTemplateTypeEnum } from '../interfaces/mailTemplate.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { MailTemplate } from '../entities/mailTemplate.entity';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class EmailsService {
  from: string;

  constructor(
    @InjectRepository(MailTemplate)
    private readonly mailTemplatesRepository: Repository<MailTemplate>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly mailService: MailService,

    private readonly configService: ConfigService,
  ) {
    this.from = this.configService.get<string>(constants.WILSON_SENDGRID_FROM_EMAIL);
    this.mailService.setApiKey(this.configService.get<string>(constants.WILSON_SENDGRID_API_KEY));
  }

  public async sendEmail(
    templateType: MailTemplateTypeEnum,
    to: string | string[],
    emailBody: Record<string, string | number>,
  ) {
    const template = await this.mailTemplatesRepository.findOne({ where: { type: MailTemplateTypeEnum.WELCOME } });

    if (!template) {
      throw new BadRequestException('Template for this email was not found');
    }

    return this.mailService.send({
      from: this.from,
      personalizations: [
        {
          dynamicTemplateData: emailBody,
          to,
          subject: template.subject,
        },
      ],
      templateId: template.templateId,
    });
  }
}
