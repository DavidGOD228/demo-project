import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignWinnersDto } from '../interfaces/assignWinners.dto';
import { PromotionsService } from '../services/promotions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Promotion } from '../entities/promotion.entity';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/modules/users/interfaces/user.enum';
import { BaseApiCreatedResponses } from 'src/common/decorators/baseApi.decorator';
import { ApiFile } from 'src/common/interceptors';
import { FileInterceptor } from '@nestjs/platform-express';
import { FeedSubmission, PromotionMediaResponse } from '../interfaces';
import { handleError } from 'src/common/errorHandler';
import { GetFeedSubmissionsDto } from '../interfaces/getFeedSubmissions.dto';

@ApiTags('Promotions')
@UseGuards(JwtAuthGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

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

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @Get('submissions')
  async getFeedSubmissions(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) params: GetFeedSubmissionsDto,
  ): Promise<FeedSubmission[]> {
    try {
      return await this.promotionsService.getSubmissions(params);
    } catch (error) {
      handleError(error, 'getFeedSubmissions');
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @Post('/winners')
  async assignWinners(@Body(new ValidationPipe()) body: AssignWinnersDto): Promise<Promotion> {
    try {
      return this.promotionsService.assignWinners(body);
    } catch (error) {
      handleError(error, 'assignWinners');
    }
  }
}
