import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AssignWinnersDto } from '../interfaces/assignWinners.dto';
import { PromotionsService } from '../services/promotions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Promotion } from '../entities/promotion.entity';

@ApiTags('Promotions')
@UseGuards(JwtAuthGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @Post('/winners')
  async assignWinners(@Body(new ValidationPipe()) body: AssignWinnersDto): Promise<Promotion> {
    try {
      return this.promotionsService.assignWinners(body);
    } catch (error) {
      console.log(error);
    }
  }
}
