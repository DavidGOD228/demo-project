import { Controller, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiFile } from 'src/common/interceptors/apiFile.interceptor';
import { RecognitionService } from '../services/recognition.service';
import { GetWidgetPromotionDto } from '../interfaces/getWidgetPromotion.dto';
import { Promotion } from '../../promotions/entities/promotion.entity';
import { RequestWithUserParams } from '../../../common/interfaces';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { handleError } from '../../../common/errorHandler';
import { SentryInterceptor } from '../../../common/interceptors';
import { BaseApiCreatedResponses } from 'src/common/decorators/baseApi.decorator';
import { GetChannelByImage } from '../interfaces/interfaces';
import { Channel } from '../../channels/entities/channel.entity';

@UseInterceptors(SentryInterceptor)
@ApiTags('Recognition')
@Controller('recognition')
export class RecognitionController {
  constructor(public recognitionService: RecognitionService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  public async recognize(
    @Req() req: RequestWithUserParams,
    @Query(new ValidationPipe()) query: GetWidgetPromotionDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    promotions: (Promotion & { widgetId: string }) | (Promotion & { widgetId: string })[];
    channel?: Channel;
  }> {
    try {
      return this.recognitionService.getBallPromotion(query, file, req.user.id);
    } catch (error) {
      handleError(error, 'recognize');
    }
  }

  @Post('/channel')
  @BaseApiCreatedResponses()
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  public async recognizeChannel(@UploadedFile() file: Express.Multer.File): Promise<GetChannelByImage> {
    try {
      return this.recognitionService.getChannelByImage(file);
    } catch (error) {
      handleError(error, 'recognizeChannel');
    }
  }
}
