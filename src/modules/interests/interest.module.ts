import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Interest } from './entities/interest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interest, User])],
})
export class InterestModule {}
