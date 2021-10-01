import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
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
  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
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
