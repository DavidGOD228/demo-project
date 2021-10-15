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
  Param,
  ParseUUIDPipe,
  ValidationPipe,
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
  LikesFilterDto,
  PromotionsFilterDto,
} from '../interfaces/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUserParams, SuccessResponseMessage } from 'src/common/interfaces';
import { UserAvatarResponse, UserAvatarUploadResponse } from '../interfaces';
import { UserService } from '../services/user.service';
import { handleError } from '../../../common/errorHandler';
import { ApiFile } from 'src/common/interceptors/apiFile.interceptor';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from '../interfaces/user.enum';
import { SentryInterceptor } from '../../../common/interceptors';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { BaseApiUserOkResponses } from 'src/common/decorators/baseApi.decorator';
import { Widget } from 'src/modules/widgets/entities/widget.entity';
import { UsersPromotion } from '../entities/usersPromotions.entity';

@UseInterceptors(SentryInterceptor)
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @ApiBearerAuth()
  @BaseApiUserOkResponses()
  @Patch('profile')
  async updateProfile(@Body() body: UpdateProfileDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.updateProfile(body, req.user.id);
    } catch (error) {
      handleError(error, 'updateProfile');
    }
  }

  @ApiBearerAuth()
  @BaseApiUserOkResponses()
  @Patch('interests')
  async updateUserInterests(@Body() body: UpdateUserInterestsDto, @Req() req: RequestWithUserParams): Promise<User> {
    try {
      return await this.usersService.updateUserInterests(body, req.user.id);
    } catch (error) {
      handleError(error, 'updateUserInterests');
    }
  }

  @ApiBearerAuth()
  @BaseApiUserOkResponses()
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
  @BaseApiUserOkResponses()
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
      handleError(error, 'addUserAvatar');
    }
  }

  @ApiBearerAuth()
  @BaseApiUserOkResponses()
  @Get('likes')
  async getUserFavorites(
    @Req() req: RequestWithUserParams,
    @Query(new ValidationPipe({ transform: true, whitelist: true })) likesFilter: LikesFilterDto,
  ): Promise<Widget[]> {
    try {
      return await this.usersService.getUserFavorites(req.user.id, likesFilter);
    } catch (error) {
      handleError(error, 'getUserFavorites');
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @Get('avatar')
  async getUserAvatar(@Req() req: RequestWithUserParams): Promise<UserAvatarResponse> {
    try {
      return await this.usersService.getUserAvatar(req.user.id);
    } catch (error) {
      handleError(error, 'getUserAvatar');
    }
  }

  @ApiBearerAuth()
  @BaseApiUserOkResponses()
  @Get('promotions')
  async getUserPromotions(
    @Req() req: RequestWithUserParams,
    @Query(new ValidationPipe({ transform: true, whitelist: true })) promotionsFilter: PromotionsFilterDto,
  ): Promise<UsersPromotion[]> {
    try {
      return await this.usersService.getUserPromotions(req.user.id, promotionsFilter);
    } catch (error) {
      handleError(error, 'getUserPromotions');
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @Get('scoreboard')
  async getUserScans(@Req() req: RequestWithUserParams): Promise<Channel[]> {
    try {
      return await this.usersService.getUserScans(req.user.id);
    } catch (error) {
      handleError(error, 'getUserScans');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @Get('all')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiForbiddenResponse({ description: ReasonPhrases.FORBIDDEN })
  async getUsersWithFilters(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) filterByPages: FilterUserPagesDto,
  ): Promise<User[]> {
    try {
      return await this.usersService.getUsersWithFilters(filterByPages);
    } catch (error) {
      handleError(error, 'getUsersWithFilters');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @Get('exportCsv')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiForbiddenResponse({ description: ReasonPhrases.FORBIDDEN })
  async exportUsersCSV(@Query() filterByPages: FilterUserPagesDto): Promise<string> {
    try {
      return await this.usersService.exportUsersCSV(filterByPages);
    } catch (error) {
      handleError(error, 'exportUsersCSV');
    }
  }

  @ApiBearerAuth()
  @Get(':id')
  async getUserById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUserParams,
  ): Promise<User> {
    try {
      return await this.usersService.getUserById(req.user.id, id);
    } catch (error) {
      handleError(error, 'getUserById');
    }
  }
}
