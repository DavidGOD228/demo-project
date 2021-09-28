import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RequestWithUserParams, SuccessResponseMessage } from 'src/common/interfaces';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import {
  AddUserFavoriteDto,
  ChangeUserOnBoardedStatusDto,
  UpdateProfileDto,
  UpdateUserInterestsDto,
} from '../interfaces/user.dto';
import { UserService } from '../services/user.service';
import { errorHandle } from '../../../common/errorHandler';

@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @ApiBearerAuth()
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOkResponse({ description: 'OK' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Patch('profile')
  async updateProfile(@Body() body: UpdateProfileDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.updateProfile(body, req.user.id);
    } catch (error) {
      errorHandle(error, 'updateProfile');
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Patch('interests')
  async updateUserInterests(@Body() body: UpdateUserInterestsDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.updateUserInterests(body, req.user.id);
    } catch (error) {
      errorHandle(error, 'updateUserInterests');
    }
  }

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
      errorHandle(error, 'changeUserOnBoardedStatus');
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @Patch('likes')
  async addUserFavorite(@Body() body: AddUserFavoriteDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.addUserFavorite(body, req.user.id);
    } catch (error) {
      errorHandle(error, 'addUserFavorite');
    }
  }
}
