import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermsOfUse } from '../entities/terms.entity';
import { CreateTermDto } from '../interfaces/terms.dto';

@Injectable()
export class TermsOfUseService {
  constructor(@InjectRepository(TermsOfUse) private readonly termsRepository: Repository<TermsOfUse>) {}

  public async getTermsById(id: string): Promise<TermsOfUse> {
    const term = await this.termsRepository.findOne(id);

    if (!term) {
      throw new NotFoundException();
    }

    return term;
  }

  public async createTerm(body: CreateTermDto): Promise<TermsOfUse> {
    const { title, mainText } = body;
    const term = this.termsRepository.create({ title: title, mainText: mainText });

    return await this.termsRepository.save(term);
  }
}
