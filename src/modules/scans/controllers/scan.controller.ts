import { Body, Controller, Get, Param, ParseUUIDPipe, Req, UseGuards, UseInterceptors, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ScanService } from '../services/scan.service';
import { handleError } from '../../../common/errorHandler';
import { SentryInterceptor } from '../../../common/interceptors';
import { RequestWithUserParams } from '../../../common/interfaces';
import { IncreaseScansDto } from '../interfaces/increaseScans.dto';

@UseInterceptors(SentryInterceptor)
@UseGuards(JwtAuthGuard)
@ApiTags('Scans')
@Controller('scans')
export class ScanController {
  constructor(private readonly scansService: ScanService) {}

  @ApiBearerAuth()
  @Get(':objectId')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  async getWidgetById(@Param('objectId', new ParseUUIDPipe({ version: '4' })) objectId: string) {
    try {
      return await this.scansService.getScansByObjectId(objectId);
    } catch (error) {
      handleError(error, 'getScansByObjectId');
    }
  }

  @ApiBearerAuth()
  @Put('/increase')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  async increaseScanNumbers(@Req() req: RequestWithUserParams, @Body() body: IncreaseScansDto) {
    try {
      return await this.scansService.increaseScanTimes(body.widgetIds, req.user.id, body.channelId);
    } catch (error) {
      handleError(error, 'increaseScanNumbers');
    }
  }
}
