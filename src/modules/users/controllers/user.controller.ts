import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
  UploadedFile,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import {
  FilterUserPagesDto,
  UpdateProfileDto,
  AddUserFavoriteDto,
  ChangeUserOnBoardedStatusDto,
  UpdateUserInterestsDto,
} from '../interfaces/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUserParams, SuccessResponseMessage } from 'src/common/interfaces';
import { UserAvatarUploadResponse } from '../interfaces';
import { UserService } from '../services/user.service';
import { handleError } from '../../../common/errorHandler';
import { ApiFile } from 'src/common/interceptors/apiFile.interceptor';
import { SentryInterceptor } from '../../../common/interceptors';

@UseInterceptors(SentryInterceptor)
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @ApiBearerAuth()
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @Patch('profile')
  async updateProfile(@Body() body: UpdateProfileDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.updateProfile(body, req.user.id);
    } catch (error) {
      handleError(error, 'updateProfile');
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @Patch('interests')
  async updateUserInterests(@Body() body: UpdateUserInterestsDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.updateUserInterests(body, req.user.id);
    } catch (error) {
      handleError(error, 'updateUserInterests');
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @Patch('onboard')
  async changeUserOnBoardedStatus(
    @Body() body: ChangeUserOnBoardedStatusDto,
    @Req() req: RequestWithUserParams,
  ): Promise<SuccessResponseMessage> {
    try {
      return await this.usersService.changeUserOnBoardedStatus(body, req.user.id);
    } catch (error) {
      handleError(error, 'changeUserOnBoardedStatus');
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @Patch('likes')
  async addUserFavorite(@Body() body: AddUserFavoriteDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.addUserFavorite(body, req.user.id);
    } catch (error) {
      handleError(error, 'addUserFavorite');
    }
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
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

  @ApiBearerAuth()
  @Get('all')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiForbiddenResponse({ description: ReasonPhrases.FORBIDDEN })
  async getUsersWithFilters(@Query() filterByPages: FilterUserPagesDto): Promise<User[]> {
    try {
      return await this.usersService.getUsersWithFilters(filterByPages);
    } catch (error) {
      console.log(error);
    }
  }

  @ApiBearerAuth()
  @Get('exportCsv')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiForbiddenResponse({ description: ReasonPhrases.FORBIDDEN })
  async exportUsersCSV(@Query() filterByPages: FilterUserPagesDto) {
    try {
      return await this.usersService.exportUsersCSV(filterByPages);
    } catch (error) {
      console.log(error.message);
    }
  }
}
