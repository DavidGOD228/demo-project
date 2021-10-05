import { Injectable } from '@nestjs/common';
import { FileService } from 'src/modules/aws/services/file.service';
import { PromotionMediaResponse } from '../interfaces';

@Injectable()
export class PromotionService {
  constructor(private readonly fileService: FileService) {}

  public async addPromotionImage({ buffer, filename }: Express.Multer.File): Promise<PromotionMediaResponse> {
    const promotionMedia = await this.fileService.uploadRawMedia(buffer, filename, 'promotions');

    return { promotionMedia };
  }
}
