import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { InterestController } from './controllers/interest.controller';
import { Interest } from './entities/interest.entity';
import { InterestService } from './services/interest.service';

@Module({
  controllers: [InterestController],
  providers: [InterestService],
  imports: [TypeOrmModule.forFeature([Interest, User])],
})
export class InterestModule {}
