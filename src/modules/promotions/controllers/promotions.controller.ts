import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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
  ApiUnauthorizedResponse,
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
import { PromotionMediaResponse } from '../interfaces';
import { handleError } from 'src/common/errorHandler';
import { ReasonPhrases } from 'http-status-codes';

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

  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @Post('/winners')
  async assignWinners(@Body(new ValidationPipe()) body: AssignWinnersDto): Promise<Promotion> {
    try {
      return this.promotionsService.assignWinners(body);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @Get(':widgetId')
  async getPromotionByWidgetId(
    @Param('widgetId', new ParseUUIDPipe({ version: '4' })) widgetId: string,
  ): Promise<Promotion> {
    try {
      return await this.promotionsService.getPromotionByWidgetId(widgetId);
    } catch (error) {
      handleError(error, 'getPromotionByWidgetId');
    }
  }
}
