import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { WidgetService } from '../services/widget.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Widgets')
@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetsService: WidgetService) {}

  @ApiBearerAuth()
  @Get(':id')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  async getWidgetById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      return await this.widgetsService.getWidgetById(id);
    } catch (error) {
      console.log(error.message);
    }
  }
}
