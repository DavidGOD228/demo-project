import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interest } from 'src/modules/interests/entities/interest.entity';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
  ChangeUserOnBoardedStatusDto,
  UpdateUserInterestsDto,
  UpdateProfileDto,
  AddUserFavoriteDto,
} from '../interfaces/user.dto';
import { SuccessResponseMessage } from 'src/common/interfaces';
import { Widget } from 'src/modules/widgets/entities/widget.entity';
import { FileService } from './file.service';
import { UserAvatarUploadResponse } from '../interfaces';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Interest) private readonly interestsRepository: Repository<Interest>,
    @InjectRepository(Widget) private readonly widgetsRepository: Repository<Widget>,
    private readonly fileService: FileService,
  ) {}

  public async updateProfile(body: UpdateProfileDto, userId: string): Promise<User> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const updatedUser = { ...user, ...body };

    await this.usersRepository.update(user.id, updatedUser);

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
      user.widgets = user.widgets.filter(widgetLike => {
        widgetLike.id !== widgetId;
      });
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
    const avatar = await this.fileService.uploadFile(user.id, imageBuffer, filename);
    return { imageUrl: avatar };
  }
}
