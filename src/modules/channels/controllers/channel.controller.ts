import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChannelService } from '../services/channel.service';
import { handleError } from '../../../common/errorHandler';
import { IGetChannel } from '../interfaces/interfaces';
import { Channel } from '../entities/channel.entity';
import { BaseApiUserOkResponses } from 'src/common/decorators/baseApi.decorator';

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
  public getChannels(): Promise<IGetChannel[]> {
    try {
      return this.channelService.getChannels();
    } catch (error) {
      handleError(error, 'getChannels');
    }
  }

  @ApiBearerAuth()
  @BaseApiUserOkResponses()
  @Get(':id')
  async getChannelById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<Channel> {
    try {
      return await this.channelService.getChannelById(id);
    } catch (error) {
      handleError(error, 'getChannelById');
    }
  }
}
