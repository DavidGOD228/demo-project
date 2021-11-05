import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Interest } from 'src/modules/interests/entities/interest.entity';
import { User } from '../entities/user.entity';
import { UserAvatarResponse, UserAvatarUploadResponse, UsersWithFiltersResponse } from '../interfaces';
import {
  FilterUserPagesDto,
  ChangeUserOnBoardedStatusDto,
  UpdateUserInterestsDto,
  UpdateProfileDto,
  AddUserFavoriteDto,
  LikesFilterDto,
  PromotionsFilterDto,
} from '../interfaces/user.dto';
import { SuccessResponseMessage } from 'src/common/interfaces';
import { Widget } from 'src/modules/widgets/entities/widget.entity';
import { FileService } from '../../aws/services/file.service';
import { ExportCsvService } from 'src/modules/config/services/csvExport.service';
import { MailTemplateTypeEnum } from '../../emails/interfaces/mailTemplate.enum';
import { EmailsService } from '../../emails/services/emails.service';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { UserRoleEnum } from '../interfaces/user.enum';
import { UsersPromotion } from '../entities/usersPromotions.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Interest)
    private readonly interestsRepository: Repository<Interest>,

    @InjectRepository(Widget)
    private readonly widgetsRepository: Repository<Widget>,

    @InjectRepository(UsersPromotion)
    private readonly usersPromotionsRepository: Repository<UsersPromotion>,

    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,

    private readonly fileService: FileService,
    private readonly csvService: ExportCsvService,
    private readonly emailService: EmailsService,
  ) {}

  public concatenatedField = 'name';

  public isProfileFilledOut(user: User) {
    return !!(user.firstName && user.lastName && user.email);
  }

  public async updateProfile(body: UpdateProfileDto, userId: string): Promise<User> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const userEmailExist = await this.usersRepository.findOne({ where: { id: Not(userId), email: body.email } });

    if (userEmailExist) {
      throw new BadRequestException('User with such email already exists!');
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

  public async getUserFavorites(userId: string, { limit, pageNumber }: LikesFilterDto): Promise<Widget[]> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    return await this.widgetsRepository
      .createQueryBuilder('widgets')
      .select(['widgets.id', 'widgets.title', 'widgets.thumbnailUrl'])
      .leftJoin('widgets.users', 'user')
      .andWhere('user.id = :userId', { userId: user.id })
      .limit(limit)
      .offset((pageNumber - 1) * limit)
      .getMany();
  }

  public async getUserAvatar(userId: string): Promise<UserAvatarResponse> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    if (user?.imageUrl) {
      const userAvatar = this.fileService.getImageUrl(user?.imageUrl);

      return { userAvatar };
    } else {
      throw new NotFoundException('This user does not have avatar!');
    }
  }

  public async getUserPromotions(
    userId: string,
    { limit, pageNumber }: PromotionsFilterDto,
  ): Promise<UsersPromotion[]> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    return await this.usersPromotionsRepository
      .createQueryBuilder('userPromotions')
      .leftJoin('userPromotions.promotion', 'promotions')
      .addSelect(['promotions.id', 'promotions.imageUrl'])
      .leftJoin('userPromotions.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .leftJoin('promotions.widget', 'widget')
      .addSelect(['widget.title'])
      .limit(limit)
      .offset((pageNumber - 1) * limit)
      .getMany();
  }

  public async getUserScans(userId: string): Promise<Channel[]> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    return await this.channelsRepository
      .createQueryBuilder('channels')
      .select(['channels.id', 'channels.league'])
      .leftJoin('channels.scans', 'scans')
      .addSelect(['scans.number'])
      .andWhere('scans.object_id = :userId', { userId: user.id })
      .getMany();
  }

  public async getUsersWithFilters(filterByPages: FilterUserPagesDto): Promise<UsersWithFiltersResponse> {
    const { limit: take, pageNumber: skip, fieldName: sortField, order: sortOrder } = filterByPages;

    const usersQuery = await this.usersRepository
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
      .offset((skip - 1) * take);

    if (sortField === this.concatenatedField) {
      usersQuery
        .orderBy('LOWER(users.firstName)', sortOrder === 'DESC' ? 'DESC' : 'ASC')
        .addOrderBy('LOWER(users.lastName)', sortOrder === 'DESC' ? 'DESC' : 'ASC');
    } else if (sortField === 'email' || sortField === 'location') {
      usersQuery.orderBy(`LOWER${sortField})`, sortOrder === 'DESC' ? 'DESC' : 'ASC');
    } else {
      usersQuery.orderBy(sortField, sortOrder === 'DESC' ? 'DESC' : 'ASC');
    }

    const users = await usersQuery.getRawMany();

    const length = await this.usersRepository.createQueryBuilder('usersAll').getCount();

    return { users, length };
  }

  public async exportUsersCSV(body: FilterUserPagesDto): Promise<string> {
    const users = await this.getUsersWithFilters(body);

    if (users.users.length) {
      const csv = await this.csvService.exportCsv(users.users, 'Users');

      return csv;
    }

    return 'There is no available data for such parameters';
  }

  public async getUserById(userId: string, reqUserId?: string): Promise<User> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException('There is no such user!');
    }

    if (reqUserId) {
      if (user.id === reqUserId || user.role === UserRoleEnum.ADMIN) {
        return user;
      } else {
        throw new ForbiddenException();
      }
    }

    return { ...user, imageUrl: user.imageUrl ? this.fileService.getImageUrl(user.imageUrl) : undefined };
  }
}
