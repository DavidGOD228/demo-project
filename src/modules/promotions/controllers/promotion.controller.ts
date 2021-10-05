import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { BaseApiCreatedResponses } from 'src/common/decorators/baseApi.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { handleError } from 'src/common/errorHandler';
import { ApiFile } from 'src/common/interceptors/apiFile.interceptor';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { UserRoleEnum } from 'src/modules/users/interfaces/user.enum';
import { PromotionMediaResponse } from '../interfaces';
import { PromotionService } from '../services/promotion.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Promotions')
@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionsService: PromotionService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('promotionImage')
  async addPromotionImage(@UploadedFile() file: Express.Multer.File): Promise<PromotionMediaResponse> {
    try {
      return await this.promotionsService.addPromotionImage(file);
    } catch (error) {
      handleError(error, 'addPromotionImage');
    }
  }
}
