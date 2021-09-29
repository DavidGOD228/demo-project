import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { WidgetService } from '../services/widget.service';
import { GetWidgetFeedDto } from '../interfaces/getWidgetFeed.dto';
import { RequestWithUserParams } from '../../../common/interfaces';
import { errorHandle } from '../../../common/errorHandler';
import { UpdateCarouselDto } from '../interfaces/updateCarousel.dto';
import { Widget } from '../entities/widget.entity';

@UseGuards(JwtAuthGuard)
@ApiTags('Widgets')
@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetsService: WidgetService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('feed')
  async getWidgetFeed(
    @Req() req: RequestWithUserParams,
    @Query(new ValidationPipe({ transform: true })) params: GetWidgetFeedDto,
  ) {
    try {
      return this.widgetsService.generateWidgetFeed(req.user.id, params);
    } catch (error) {
      errorHandle(error, 'getWidgetFeed');
    }
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getWidgetById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      return await this.widgetsService.getWidgetById(id);
    } catch (error) {
      errorHandle(error, 'getWidgetById');
    }
  }

  @ApiBearerAuth()
  @Put('/carousel')
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateCarouselWidget(@Body(new ValidationPipe({ whitelist: true })) body: UpdateCarouselDto): Promise<Widget> {
    try {
      return this.widgetsService.updateCarousel(body);
    } catch (error) {
      errorHandle(error, 'updateCarouselWidget');
    }
  }
}
