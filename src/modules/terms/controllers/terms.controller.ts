import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { TermsOfUse } from '../entities/terms.entity';
import { CreateTermDto } from '../interfaces/terms.dto';
import { TermsOfUseService } from '../services/terms.service';
import { SentryInterceptor } from '../../../common/interceptors';

@UseInterceptors(SentryInterceptor)
@ApiTags('Terms Of Use')
@UseGuards(JwtAuthGuard)
@Controller('terms')
export class TermsOfUseController {
  constructor(private readonly termsService: TermsOfUseService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @Get(':id')
  async getTermsById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<TermsOfUse> {
    try {
      return await this.termsService.getTermsById(id);
    } catch (error) {
      console.log(error.message);
    }
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @Post('/addTerms')
  async createTerm(@Body() body: CreateTermDto): Promise<TermsOfUse> {
    try {
      return await this.termsService.createTerm(body);
    } catch (error) {
      console.log(error.message);
    }
  }
}
