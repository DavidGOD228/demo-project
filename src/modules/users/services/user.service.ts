import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interest } from 'src/modules/interests/entities/interest.entity';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { updateProfileDto, updateUserInterestsDto } from '../interfaces/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Interest) private readonly interestsRepository: Repository<Interest>,
  ) {}

  public async updateProfile(body: updateProfileDto, userId: string): Promise<User> {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const updatedUser = { ...user, ...body };
    await this.usersRepository.update(user.id, updatedUser);
    return updatedUser;
  }

  public async updateUserInterests(body: updateUserInterestsDto, userId: string): Promise<User> {
    const interests = await this.interestsRepository.find({ where: { id: In(body.interestsIds) } });
    const user = await this.usersRepository.findOne(userId);
    user.interests = interests;
    return await this.usersRepository.save(user);
  }
}
