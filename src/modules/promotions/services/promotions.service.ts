import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssignWinnersDto } from '../interfaces/assignWinners.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Widget } from '../../widgets/entities/widget.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Promotion } from '../entities/promotion.entity';
import { EmailsService } from '../../emails/services/emails.service';
import { MailTemplateTypeEnum } from '../../emails/interfaces/mailTemplate.enum';
import {
  FeedSubmission,
  FeedSubmissionResponse,
  GetSubmissionsWinnersEnum,
  PromotionMediaResponse,
  SubmissionsFilterTypeEnum,
} from '../interfaces';
import { FileService } from 'src/modules/aws/services/file.service';
import { GetFeedSubmissionsDto } from '../interfaces/getFeedSubmissions.dto';
import { GetPromotionErrorEnum } from '../interfaces/promotions.enum';
import { UsersPromotion } from '../../users/entities/usersPromotions.entity';
import { UserService } from '../../users/services/user.service';
import { ExportCsvService } from 'src/modules/config/services/csvExport.service';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,

    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UsersPromotion)
    private readonly usersPromotionRepository: Repository<UsersPromotion>,

    private readonly emailsService: EmailsService,

    private readonly fileService: FileService,

    private readonly userService: UserService,

    private readonly csvService: ExportCsvService,
  ) {}

  public concatenatedField = 'name';

  public addFilterQuery(
    qb: SelectQueryBuilder<UsersPromotion>,
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

      case SubmissionsFilterTypeEnum.WINNER:
        return qb.andWhere(`winners.id IS ${filterValue === 'true' ? 'NOT' : ''} NULL`);
    }
  }

  public async addPromotionImage({ buffer, filename }: Express.Multer.File): Promise<PromotionMediaResponse> {
    const promotionMedia = await this.fileService.uploadRawMedia(buffer, filename, 'promotions');

    return { promotionMedia };
  }

  public async getSubmissions({
    fieldName,
    filteringWinner,
    filteringType,
    filteringTitle,
    order,
    limit,
    pageNumber,
  }: GetFeedSubmissionsDto): Promise<FeedSubmissionResponse> {
    const submissionsQuery = this.usersPromotionRepository
      .createQueryBuilder('userPromotions')
      .leftJoinAndSelect('userPromotions.promotion', 'promotions')
      .leftJoinAndSelect('promotions.widget', 'widget')
      .leftJoinAndSelect('userPromotions.user', 'users')
      .leftJoinAndSelect('users.wonPromotions', 'wonPromotions', 'wonPromotions.id = promotions.id');

    if (fieldName && order) {
      if (fieldName === this.concatenatedField) {
        submissionsQuery.orderBy('users.firstName', order).addOrderBy('users.lastName', order);
      } else {
        submissionsQuery.orderBy(`${fieldName}`, order);
      }
    }

    if (filteringWinner?.length === 1) {
      submissionsQuery.andWhere(
        `winners.id IS ${filteringWinner[0] === GetSubmissionsWinnersEnum.WINNER ? 'NOT' : ''} NULL`,
        { types: filteringWinner },
      );
    }

    if (filteringType) {
      submissionsQuery.where('widget.type IN (:...types)', { types: filteringType });
    }

    if (filteringTitle) {
      submissionsQuery.where('widget.id IN (:...titles)', { titles: filteringTitle });
    }

    submissionsQuery.take(limit).skip((pageNumber - 1) * limit);

    const submissions = await submissionsQuery.getMany();
    const length = await submissionsQuery.getCount();

    const submissionsAll: FeedSubmission[] = submissions.map(item => ({
      name: `${item.user.firstName} ${item.user.lastName}`,
      email: item.user.email,
      title: item.promotion.widget.title,
      type: item.promotion.widget.type,
      userId: item.user.id,
      promotionId: item.promotion.id,
      widgetId: item.promotion.widget.id,
      winner: !!item.user.wonPromotions.length,
    }));

    return { submissions: submissionsAll, length };
  }

  public async exportSubmissionsCSV(body: GetFeedSubmissionsDto) {
    const submissions = await this.getSubmissions(body);

    if (submissions.submissions.length) {
      const csv = await this.csvService.exportCsv(submissions.submissions, 'Submissions');

      return csv;
    }

    return 'There is no available data for such parameters';
  }

  public async confirmUserPromotions(userId: string, promotionIds: string[]): Promise<UsersPromotion[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const isProfileFilled = this.userService.isProfileFilledOut(user);

    if (!isProfileFilled) {
      throw new BadRequestException({
        message: 'User profile is not filled out',
        key: GetPromotionErrorEnum.UNFILLED_USER_DATA,
      });
    }

    const promotions = await this.promotionRepository.findByIds(promotionIds);

    const userPromotions = promotions.map(async promotion => {
      const userPromotion = await this.usersPromotionRepository.findOne({
        where: {
          promotion,
          user,
        },
      });

      if (userPromotion) {
        userPromotion.isConfirmed = isProfileFilled;

        return this.usersPromotionRepository.save(userPromotion);
      } else {
        const newUserPromotion = this.usersPromotionRepository.create({
          user,
          promotion,
          isConfirmed: isProfileFilled,
        });

        return this.usersPromotionRepository.save(newUserPromotion);
      }
    });

    return Promise.all(userPromotions);
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

  public async getPromotionByWidgetId(widgetId: string): Promise<Promotion> {
    const widget = await this.widgetRepository.findOne(widgetId, { relations: ['promotion'] });

    if (!widget) {
      throw new NotFoundException('Widget with such id does not exist!');
    }

    if (!widget.promotion) {
      throw new NotFoundException('This widget does not have a promotion!');
    }

    const promotion = await this.promotionRepository
      .createQueryBuilder('promotion')
      .leftJoin('promotion.widget', 'widget')
      .where('widget.id = :widgetId', { widgetId: widget.id })
      .getOne();

    return promotion;
  }
}
