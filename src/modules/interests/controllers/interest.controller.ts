import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Interest } from '../entities/interest.entity';
import { InterestService } from '../services/interest.service';

@UseGuards(JwtAuthGuard)
@Controller('interests')
export class InterestController {
  constructor(private readonly interestsService: InterestService) {}

  @ApiTags('Interests')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @Get('/')
  async getAllInterests(): Promise<Interest[]> {
    try {
      return await this.interestsService.getAllInterests();
    } catch (error) {
      console.log(error.message);
    }
  }
}
