import { Injectable, NotFoundException } from '@nestjs/common';
import { AssignWinnersDto } from '../interfaces/assignWinners.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Widget } from '../../widgets/entities/widget.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Promotion } from '../entities/promotion.entity';
import { EmailsService } from '../../emails/services/emails.service';
import { MailTemplateTypeEnum } from '../../emails/interfaces/mailTemplate.enum';
import { FeedSubmission, PromotionMediaResponse, SubmissionsFilterTypeEnum } from '../interfaces';
import { FileService } from 'src/modules/aws/services/file.service';
import { GetFeedSubmissionsDto } from '../interfaces/getFeedSubmissions.dto';

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

    private readonly fileService: FileService,
  ) {}

  public addFilterQuery(
    qb: SelectQueryBuilder<Promotion>,
    filterType: SubmissionsFilterTypeEnum,
    filterValue: string | string[] = [],
  ) {
    switch (filterType) {
      case SubmissionsFilterTypeEnum.NAME:
        return qb.orderBy('name', filterValue === 'DESC' ? 'DESC' : 'ASC');

      case SubmissionsFilterTypeEnum.EMAIL:
        return qb.orderBy('email', filterValue === 'DESC' ? 'DESC' : 'ASC');

      case SubmissionsFilterTypeEnum.TITLE:
        if (!filterValue.length) break;

        return qb.where('widget.id IN (:...widgetIds)', {
          widgetIds: typeof filterValue === 'string' ? [filterValue] : filterValue,
        });

      case SubmissionsFilterTypeEnum.TYPE:
        if (!filterValue.length) break;

        return qb.where('widget.type IN (:...widgetTypes)', {
          widgetTypes: typeof filterValue === 'string' ? [filterValue] : filterValue,
        });
    }
  }

  public async addPromotionImage({ buffer, filename }: Express.Multer.File): Promise<PromotionMediaResponse> {
    const promotionMedia = await this.fileService.uploadRawMedia(buffer, filename, 'promotions');

    return { promotionMedia };
  }

  public async getSubmissions({
    filterType,
    filterValue,
    limit,
    pageNumber,
  }: GetFeedSubmissionsDto): Promise<FeedSubmission[]> {
    const submissionsQuery = await this.promotionRepository
      .createQueryBuilder('promotions')
      .leftJoinAndSelect('promotions.widget', 'widget')
      .leftJoinAndSelect('promotions.users', 'users')
      .select([
        'users.id as userId',
        'users.email as email',
        'widget.id as widgetId',
        'widget.title as title',
        'widget.type as type',
      ])
      .addSelect("CONCAT_WS(' ', users.firstName, users.lastName)", 'name');

    if (filterType) {
      this.addFilterQuery(submissionsQuery, filterType, filterValue);
    }

    const submissions = await submissionsQuery.getRawMany<FeedSubmission>();

    // making pagination with js array method because typeorm query builder methods
    // offset+limit/skip+take doesn't work properly with joins and getRawMany
    return submissions.slice((pageNumber - 1) * limit, pageNumber * limit);
  }

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
