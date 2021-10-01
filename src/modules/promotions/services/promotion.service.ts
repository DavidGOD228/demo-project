import { Injectable } from '@nestjs/common';
import { FileService } from 'src/modules/aws/services/file.service';
import { PromotionMediaResponse } from '../interfaces';

@Injectable()
export class PromotionService {
  constructor(private readonly fileService: FileService) {}

  public async addPromotionImage(file: Express.Multer.File): Promise<PromotionMediaResponse> {
    const { buffer, filename } = file;

    const promotionMedia = await this.fileService.uploadRawMedia(buffer, filename, 'promotions');

    return { promotionMedia: promotionMedia };
  }
}
