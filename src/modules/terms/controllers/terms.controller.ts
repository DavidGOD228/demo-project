import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
import { handleError } from 'src/common/errorHandler';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { TermsOfUse } from '../entities/terms.entity';
import { CreateTermDto, GetTermsDto } from '../interfaces/terms.dto';
import { TermsOfUseService } from '../services/terms.service';
import { SentryInterceptor } from '../../../common/interceptors';

@UseInterceptors(SentryInterceptor)
@ApiTags('Terms Of Use')
@Controller('terms')
export class TermsOfUseController {
  constructor(private readonly termsService: TermsOfUseService) {}

  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @Get('/')
  async getTermsByType(
    @Query(new ValidationPipe({ whitelist: true, transform: true })) query: GetTermsDto,
  ): Promise<TermsOfUse> {
    try {
      return await this.termsService.getTermsByType(query.type);
    } catch (error) {
      handleError(error, 'getTermsByType');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @Get(':id')
  async getTermsById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<TermsOfUse> {
    try {
      return await this.termsService.getTermsById(id);
    } catch (error) {
      handleError(error, 'getTermsById');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @Post('/addTerms')
  async createTerm(@Body() body: CreateTermDto): Promise<TermsOfUse> {
    try {
      return await this.termsService.createTerm(body);
    } catch (error) {
      handleError(error, 'createTerm');
    }
  }
}
