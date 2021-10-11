import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssignWinnersDto } from '../interfaces/assignWinners.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Widget } from '../../widgets/entities/widget.entity';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Promotion } from '../entities/promotion.entity';
import { EmailsService } from '../../emails/services/emails.service';
import { MailTemplateTypeEnum } from '../../emails/interfaces/mailTemplate.enum';
import { PromotionMediaResponse } from '../interfaces';
import { FileService } from 'src/modules/aws/services/file.service';
import { GetPromotionErrorEnum } from '../interfaces/promotions.enum';
import { UsersPromotion } from '../../users/entities/usersPromotions.entity';
import { UserService } from '../../users/services/user.service';

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
  ) {}

  public async addPromotionImage({ buffer, filename }: Express.Multer.File): Promise<PromotionMediaResponse> {
    const promotionMedia = await this.fileService.uploadRawMedia(buffer, filename, 'promotions');

    return { promotionMedia };
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
}
