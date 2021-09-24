import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interest } from '../entities/interest.entity';

@Injectable()
export class InterestService {
  constructor(@InjectRepository(Interest) private readonly interestsRepository: Repository<Interest>) {}

  public async getAllInterests(): Promise<Interest[]> {
    return await this.interestsRepository.find();
  }
}
