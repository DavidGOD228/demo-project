import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiForbiddenResponse,
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
import { BaseApiAdminOkResponses, BaseApiCreatedResponses } from 'src/common/decorators/baseApi.decorator';
import { ApiFile } from 'src/common/interceptors';
import { FileInterceptor } from '@nestjs/platform-express';
import { FeedSubmissionResponse, PromotionMediaResponse } from '../interfaces';
import { handleError } from 'src/common/errorHandler';
import { ReasonPhrases } from 'http-status-codes';
import { GetFeedSubmissionsDto } from '../interfaces/getFeedSubmissions.dto';
import { ConfirmPromotionsDto } from '../interfaces/ConfirmPromotions.dto';
import { RequestWithUserParams } from '../../../common/interfaces';
import { UsersPromotion } from '../../users/entities/usersPromotions.entity';

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
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('promotionCollaborationImage')
  async addPromotionCollaborationImage(@UploadedFile() file: Express.Multer.File): Promise<PromotionMediaResponse> {
    try {
      return await this.promotionsService.addPromotionCollaborationImage(file);
    } catch (error) {
      handleError(error, 'addPromotionImage');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiAdminOkResponses()
  @Get('submissions')
  async getFeedSubmissions(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) params: GetFeedSubmissionsDto,
  ): Promise<FeedSubmissionResponse> {
    try {
      return await this.promotionsService.getSubmissions(params);
    } catch (error) {
      handleError(error, 'getFeedSubmissions');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @Get('submissions/exportCsv')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiForbiddenResponse({ description: ReasonPhrases.FORBIDDEN })
  async exportSubmissionsCSV(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) params: GetFeedSubmissionsDto,
  ): Promise<string> {
    try {
      return await this.promotionsService.exportSubmissionsCSV(params);
    } catch (error) {
      handleError(error, 'exportSubmissionsCSV');
    }
  }

  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @Patch('confirm')
  async confirmPromotions(
    @Req() req: RequestWithUserParams,
    @Body() body: ConfirmPromotionsDto,
  ): Promise<UsersPromotion[]> {
    try {
      return this.promotionsService.confirmUserPromotions(req.user.id, body.promotionIds);
    } catch (error) {
      handleError(error, 'confirmPromotions');
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
      handleError(error, 'assignWinners');
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
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
