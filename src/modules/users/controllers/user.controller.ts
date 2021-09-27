import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RequestWithUserParams, SuccessResponseMessage } from 'src/common/interfaces';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { ChangeUserOnBoardedStatusDto, UpdateProfileDto, UpdateUserInterestsDto } from '../interfaces/user.dto';
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
  async updateProfile(@Body() body: UpdateProfileDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.updateProfile(body, req.user.id);
    } catch (error) {
      console.log(error.message);
    }
  }

  @ApiTags('Users')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Patch('interests')
  async updateUserInterests(@Body() body: UpdateUserInterestsDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.updateUserInterests(body, req.user.id);
    } catch (error) {
      console.log(error.message)
    }
  }

  @ApiTags('Users')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Patch('onboard')
  async changeUserOnBoardedStatus(
    @Body() body: ChangeUserOnBoardedStatusDto,
    @Req() req: RequestWithUserParams,
  ): Promise<SuccessResponseMessage> {
    try {
      return await this.usersService.changeUserOnBoardedStatus(body, req.user.id);
    } catch (error) {
      console.log(error.message);
    }
  }
}
