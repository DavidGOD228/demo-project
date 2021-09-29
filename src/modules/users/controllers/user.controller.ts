import { Body, Controller, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiFile } from 'src/common/interceptors';
import { RequestWithUserParams, SuccessResponseMessage } from 'src/common/interfaces';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { UserAvatarUploadResponse } from '../interfaces';
import {
  AddUserFavoriteDto,
  ChangeUserOnBoardedStatusDto,
  UpdateProfileDto,
  UpdateUserInterestsDto,
} from '../interfaces/user.dto';
import { UserService } from '../services/user.service';

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
      console.log(error.message);
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
      console.log(error.message);
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
      console.log(error.message);
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
      console.log(error.message);
    }
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: 'Created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('avatar')
  async addUserAvatar(
    @Req() req: RequestWithUserParams,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserAvatarUploadResponse> {
    try {
      return await this.usersService.addUserAvatar(req.user.id, file.buffer, file.originalname);
    } catch (error) {
      console.log(error.message);
    }
  }
}
