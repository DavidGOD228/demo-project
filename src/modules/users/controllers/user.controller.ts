import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RequestWithUserParams } from 'src/common/interfaces';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { updateProfileDto } from '../interfaces/user.dto';
import { UserService } from '../services/user.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @ApiTags('Users')
  @ApiBearerAuth()
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOkResponse({ description: 'OK' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Patch('profile')
  async updateProfile(@Body() body: updateProfileDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.updateProfile(body, req.user.id);
    } catch (error) {
      console.log(error.message);
    }
  }
}
