import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReasonPhrases } from 'http-status-codes';
import { ApiFile } from 'src/common/interceptors/apiFile.interceptor';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChannelService } from '../services/channel.service';
import { handleError } from '../../../common/errorHandler';
import { IGetChannel } from '../interfaces/interfaces';

@UseGuards(JwtAuthGuard)
@ApiTags('Channels')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('/')
  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  public getChannels(): Promise<IGetChannel[]> {
    try {
      return this.channelService.getChannels();
    } catch (error) {
      handleError(error, 'getChannels');
    }
  }
}
