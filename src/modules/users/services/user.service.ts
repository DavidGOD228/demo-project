import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { updateProfileDto } from '../interfaces/user.dto';
import { MailTemplateTypeEnum } from '../../emails/interfaces/mailTemplate.enum';
import { EmailsService } from '../../emails/services/emails.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly emailService: EmailsService,
  ) {}

  public async updateProfile(body: updateProfileDto, userId: string): Promise<User> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const updatedUser = { ...user, ...body };
    await this.usersRepository.update(user.id, updatedUser);

    if (!user.email && body.email) {
      await this.emailService.sendEmail(MailTemplateTypeEnum.WELCOME, body.email, {
        name: `${body.firstName} ${body.lastName}`,
      });
    }

    return updatedUser;
  }
}
