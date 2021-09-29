import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scan } from '../entities/scan.entity';

@Injectable()
export class ScanService {
  constructor(@InjectRepository(Scan) private readonly scansRepository: Repository<Scan>) {}

  public async getScansByObjectId(objectId: string) {
    const scan = await this.scansRepository.find({ where: { objectId: objectId } });
    if (!scan) {
      throw new NotFoundException();
    }
    return scan;
  }
}
