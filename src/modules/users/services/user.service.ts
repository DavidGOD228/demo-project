import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UsersWithFiltersResponse } from '../interfaces';
import { FilterUserPagesDto, UpdateProfileDto } from '../interfaces/user.dto';

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

  public async getUsersWithFilters(filterByPages: FilterUserPagesDto): Promise<UsersWithFiltersResponse> {
    const { limit: take, page: skip, fieldName: sortField, order: sortOrder } = filterByPages;

    const table = [
      {
        fieldName: 'User ID',
        props: ['id'],
      },
      {
        fieldName: 'Name',
        props: ['firstName', 'lastName'],
      },
      {
        fileName: 'Email Address',
        props: ['email'],
      },
      {
        fieldName: 'Location',
        props: ['location'],
      },
      {
        fieldName: 'Phone',
        props: ['phoneNumber'],
      },
      {
        fieldName: 'Last Login',
        props: ['lastLoginAt'],
      },
      {
        fieldName: 'Created at',
        props: ['createdAt'],
      },
    ];

    const users = await this.usersRepository.find({
      take: take,
      skip: (skip - 1) * take,
      order: {
        [sortField]: sortOrder === 'DESC' ? 'DESC' : 'ASC',
      },
      select: ['id', 'firstName', 'lastName', 'email', 'location', 'phoneNumber', 'lastLoginAt', 'createdAt'],
    });

    return { table: table, users: users };
  }
}
