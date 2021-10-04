import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Interest } from '../entities/interest.entity';
import { InterestService } from '../services/interest.service';
import { handleError } from '../../../common/errorHandler';
import { SentryInterceptor } from '../../../common/interceptors';

@UseInterceptors(SentryInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('interests')
export class InterestController {
  constructor(private readonly interestsService: InterestService) {}

  @ApiTags('Interests')
  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @Get('/')
  async getAllInterests(): Promise<Interest[]> {
    try {
      return await this.interestsService.getAllInterests();
    } catch (error) {
      handleError(error, 'getAllInterests');
    }
  }
}
