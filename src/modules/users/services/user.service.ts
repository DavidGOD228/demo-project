import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SuccessResponseMessage } from 'src/common/interfaces';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ChangeUserOnBoardedStatusDto, UpdateProfileDto } from '../interfaces/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  public async updateProfile(body: UpdateProfileDto, userId: string): Promise<User> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const updatedUser = { ...user, ...body };
    await this.usersRepository.update(user.id, updatedUser);
    return updatedUser;
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
}
