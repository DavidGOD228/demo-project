import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ScanService } from '../services/scan.service';
import { errorHandle } from '../../../common/errorHandler';

@UseGuards(JwtAuthGuard)
@ApiTags('Scans')
@Controller('scans')
export class ScanController {
  constructor(private readonly scansService: ScanService) {}

  @ApiBearerAuth()
  @Get(':objectId')
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getWidgetById(@Param('objectId', new ParseUUIDPipe({ version: '4' })) objectId: string) {
    try {
      return await this.scansService.getScansByObjectId(objectId);
    } catch (error) {
      errorHandle(error, 'getScansByObjectId');
    }
  }
}
