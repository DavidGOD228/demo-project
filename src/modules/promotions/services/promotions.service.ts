import { Injectable, NotFoundException } from '@nestjs/common';
import { AssignWinnersDto } from '../interfaces/assignWinners.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Widget } from '../../widgets/entities/widget.entity';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Promotion } from '../entities/promotion.entity';
import { EmailsService } from '../../emails/services/emails.service';
import { MailTemplateTypeEnum } from '../../emails/interfaces/mailTemplate.enum';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,

    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly emailsService: EmailsService,
  ) {}

  public async assignWinners({ widgetId, winners }: AssignWinnersDto): Promise<Promotion> {
    const widget = await this.widgetRepository.findOne({ where: { id: widgetId } });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    const promotion = await this.promotionRepository.findOne({ where: { widget }, relations: ['winners'] });

    if (!promotion) {
      throw new NotFoundException('This widget has no promotion');
    }

    const users = await this.userRepository.findByIds(winners);

    const usersWithEmail = users.filter(user => user.email);

    this.emailsService
      .sendEmail(
        MailTemplateTypeEnum.WINNER,
        usersWithEmail.map(user => ({
          to: user.email,
          templateBody: { userName: user.firstName, widgetName: widget.title },
        })),
      )
      .catch(e => console.log(e.message));

    promotion.winners = [...(promotion.winners || []), ...users];

    return this.promotionRepository.save(promotion);
  }
}
