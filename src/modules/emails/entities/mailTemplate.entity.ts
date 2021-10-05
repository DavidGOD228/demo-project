import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MailTemplateTypeEnum } from '../interfaces/mailTemplate.enum';

@Entity({ schema: 'cmn', name: 'mail_templates' })
export class MailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  templateId: string;

  @Column({ enum: MailTemplateTypeEnum })
  type: string;

  @Column()
  subject: string;
}
