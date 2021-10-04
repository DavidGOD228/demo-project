import { Body, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReasonPhrases } from 'http-status-codes';
import { ApiFile } from 'src/common/interceptors/apiFile.interceptor';
import { RecognitionService } from '../services/recognition.service';
import { GetWidgetPromotionDto } from '../interfaces/getWidgetPromotion.dto';
import { Promotion } from '../../promotions/entities/promotion.entity';
import { RequestWithUserParams } from '../../../common/interfaces';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { handleError } from '../../../common/errorHandler';
import { SentryInterceptor } from '../../../common/interceptors';

@UseInterceptors(SentryInterceptor)
@UseGuards(JwtAuthGuard)
@ApiTags('Recognition')
@Controller('recognition')
export class RecognitionController {
  constructor(public recognitionService: RecognitionService) {}

  @Post('/')
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  public async recognize(
    @Req() req: RequestWithUserParams,
    @Body(new ValidationPipe()) body: GetWidgetPromotionDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Promotion | Promotion[]> {
    try {
      return this.recognitionService.getBallPromotion(body, file, req.user.id);
    } catch (error) {
      handleError(error, 'recognize');
    }
  }
}
