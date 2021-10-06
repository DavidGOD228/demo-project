import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Interest } from 'src/modules/interests/entities/interest.entity';
import { User } from '../entities/user.entity';
import { UserAvatarUploadResponse } from '../interfaces';
import {
  FilterUserPagesDto,
  ChangeUserOnBoardedStatusDto,
  UpdateUserInterestsDto,
  UpdateProfileDto,
  AddUserFavoriteDto,
  FilterPromotionsDto,
} from '../interfaces/user.dto';
import { SuccessResponseMessage } from 'src/common/interfaces';
import { Widget } from 'src/modules/widgets/entities/widget.entity';
import { FileService } from '../../aws/services/file.service';
import { ExportCsvService } from 'src/modules/config/services/csvExport.service';
import { MailTemplateTypeEnum } from '../../emails/interfaces/mailTemplate.enum';
import { EmailsService } from '../../emails/services/emails.service';
import { Promotion } from 'src/modules/promotions/entities/promotion.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Interest)
    private readonly interestsRepository: Repository<Interest>,

    @InjectRepository(Widget)
    private readonly widgetsRepository: Repository<Widget>,

    @InjectRepository(Promotion)
    private readonly promotionsRepository: Repository<Promotion>,

    private readonly fileService: FileService,
    private readonly csvService: ExportCsvService,
    private readonly emailService: EmailsService,
  ) {}

  public async updateProfile(body: UpdateProfileDto, userId: string): Promise<User> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const updatedUser = { ...user, ...body };

    await this.usersRepository.update(user.id, updatedUser);

    if (!user.email && body.email) {
      await this.emailService.sendEmail(MailTemplateTypeEnum.WELCOME, [
        {
          to: body.email,
          templateBody: {
            name: `${body.firstName} ${body.lastName}`,
          },
        },
      ]);
    }

    return updatedUser;
  }

  public async updateUserInterests(body: UpdateUserInterestsDto, userId: string): Promise<User> {
    const interests = await this.interestsRepository.find({ where: { id: In(body.interestsIds) } });
    const user = await this.usersRepository.findOne(userId);

    user.interests = interests;

    return await this.usersRepository.save(user);
  }

  public async changeUserOnBoardedStatus(
    body: ChangeUserOnBoardedStatusDto,
    userId: string,
  ): Promise<SuccessResponseMessage> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    await this.usersRepository.update(user.id, { onboarded: body.onboarded });

    return { message: 'User on-boarded status successfully updated!' };
  }

  public async addUserFavorite(body: AddUserFavoriteDto, userId: string): Promise<User> {
    const { likeExist, widgetId } = body;
    const widget = await this.widgetsRepository.findOne({ where: { id: widgetId } });

    if (!widget) {
      throw new NotFoundException('There is no widget with such id!');
    }

    const user = await this.usersRepository.findOne(userId, { relations: ['widgets'] });

    if (!user) {
      throw new NotFoundException();
    }

    if (likeExist) {
      user.widgets = user.widgets.filter(widgetLike => widgetLike.id !== widgetId);

      return await this.usersRepository.save(user);
    }

    user.widgets.push(widget);

    return await this.usersRepository.save(user);
  }

  public async addUserAvatar(userId: string, imageBuffer: Buffer, filename: string): Promise<UserAvatarUploadResponse> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      new NotFoundException();
    }

    const avatar = await this.fileService.uploadUserAvatar(user.id, imageBuffer, filename, 'users');

    return { imageUrl: avatar };
  }

  public async getUserPromotions(userId: string, { limit, pageNumber }: FilterPromotionsDto) {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    // add api in dto

    return await this.promotionsRepository
      .createQueryBuilder('promotions')
      .select(['promotions.id', 'promotions.imageUrl'])
      .leftJoin('promotions.users', 'user')
      .where('user.id = :userId', { userId: user.id })
      .leftJoin('promotions.widget', 'widget')
      .addSelect(['widget.title'])
      .limit(limit)
      .offset((pageNumber - 1) * limit)
      .getMany();
  }

  public async getUsersWithFilters(filterByPages: FilterUserPagesDto): Promise<User[]> {
    const { limit: take, page: skip, fieldName: sortField, order: sortOrder } = filterByPages;

    const users = await this.usersRepository
      .createQueryBuilder('users')
      .select([
        'users.id as id',
        'users.email as email',
        'users.location as location',
        'users.phoneNumber as phoneNumber',
        'users.lastLoginAt as lastLoginAt',
        'users.createdAt as createdAt',
      ])
      .addSelect("CONCAT_WS(' ', users.firstName, users.lastName)", 'name')
      .limit(take)
      .offset((skip - 1) * take)
      .orderBy(sortField, sortOrder === 'DESC' ? 'DESC' : 'ASC')
      .getRawMany();

    return users;
  }

  public async exportUsersCSV(body: FilterUserPagesDto): Promise<string> {
    const users = await this.getUsersWithFilters(body);
    const csv = await this.csvService.exportCsv(users, 'Users');

    return csv;
  }
}
