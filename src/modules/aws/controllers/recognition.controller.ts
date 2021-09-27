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
import { RecognitionService } from '../services/recognition.service';
import { ApiFile } from '../../../common/interceptors';
import { GetWidgetPromotionDto } from '../interfaces/getWidgetPromotion.dto';
import { Promotion } from '../../promotions/entities/promotion.entity';
import { RequestWithUserParams } from '../../../common/interfaces';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Recognition')
@Controller('recognition')
export class RecognitionController {
  constructor(public recognitionService: RecognitionService) {}

  @Post('/')
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Recognized' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: "AWS didn't recognized image" })
  @ApiNotFoundResponse({ description: 'Not Found' })
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
    } catch (e) {
      console.log(e.message);
    }
  }
}
