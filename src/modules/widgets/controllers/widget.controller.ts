import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiFile } from 'src/common/interceptors/apiFile.interceptor';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { UserRoleEnum } from 'src/modules/users/interfaces/user.enum';
import { Widget } from '../entities/widget.entity';
import {
  AddDetailsMediaResponse,
  AddFeedMediaResponse,
  AddStoryMedia,
  AddThumbnailResponse,
  FilteredWidgetsResponse,
  DeleteWidgetResponse,
  AddAuthorAvatarResponse,
} from '../interfaces';
import { CreateWidgetDto, EditWidgetDto, FilterWidgetsDto } from '../interfaces/widget.dto';
import { WidgetService } from '../services/widget.service';
import { RequestWithUserParams } from '../../../common/interfaces';
import { handleError } from '../../../common/errorHandler';
import { UpdateCarouselDto } from '../interfaces/updateCarousel.dto';
import { SentryInterceptor } from '../../../common/interceptors';
import { BaseApiCreatedResponses } from 'src/common/decorators/baseApi.decorator';
import { FilterWidgetByTitleDto } from '../interfaces/filterWidgetByTitle.dto';
import { GetWidgetFeedDto } from '../interfaces/getWidgetFeed.dto';

@UseInterceptors(SentryInterceptor)
@UseGuards(JwtAuthGuard)
@ApiTags('Widgets')
@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetsService: WidgetService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiForbiddenResponse({ description: ReasonPhrases.FORBIDDEN })
  @Get('/')
  async getFilteredWidgets(
    @Query(new ValidationPipe({ transform: true })) filterWidgets: FilterWidgetsDto,
  ): Promise<FilteredWidgetsResponse> {
    try {
      return await this.widgetsService.getFilteredWidgets(filterWidgets);
    } catch (error) {
      handleError(error, 'getFilteredWidgets');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @Get('select')
  async filterWidgetByTitle(@Query(new ValidationPipe()) params: FilterWidgetByTitleDto) {
    try {
      return this.widgetsService.filterWidgetByTitle(params);
    } catch (error) {
      handleError(error, 'filterWidgetByTitle');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @Get('exportCsv')
  async exportWidgetCsv(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) filterWidgets: FilterWidgetsDto,
  ): Promise<string> {
    try {
      return await this.widgetsService.exportWidgetCsv(filterWidgets);
    } catch (error) {
      handleError(error, 'exportWidgetCsv');
    }
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('feed/v3')
  async getWidgetFeed(@Req() req: RequestWithUserParams, @Query() query: GetWidgetFeedDto) {
    try {
      return this.widgetsService.generateWidgetFeed(req.user.id, query);
    } catch (error) {
      handleError(error, 'getWidgetFeed');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @Get('/carousel')
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getCarouselWidget(): Promise<Partial<Omit<Widget, 'childWidgets'> & { childWidgets: Partial<Widget>[] }>> {
    try {
      return this.widgetsService.getCarousel();
    } catch (error) {
      handleError(error, 'getCarousel');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @Put('/carousel')
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateCarouselWidget(@Body(new ValidationPipe({ whitelist: true })) body: UpdateCarouselDto): Promise<Widget> {
    try {
      return this.widgetsService.updateCarousel(body);
    } catch (error) {
      handleError(error, 'updateCarouselWidget');
    }
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  async getWidgetById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUserParams,
  ): Promise<Widget> {
    try {
      return await this.widgetsService.getWidgetById(id, req.user.id);
    } catch (error) {
      handleError(error, 'getWidgetById');
    }
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  async deleteWidgetById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<DeleteWidgetResponse> {
    try {
      return await this.widgetsService.deleteWidgetById(id);
    } catch (error) {
      handleError(error, 'getWidgetById');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('feedMedia')
  async addFeedMedia(@UploadedFile() file: Express.Multer.File): Promise<AddFeedMediaResponse> {
    try {
      return await this.widgetsService.addFeedMedia(file);
    } catch (error) {
      handleError(error, 'addFeedMedia');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('detailsMedia')
  async addDetailsMedia(@UploadedFile() file: Express.Multer.File): Promise<AddDetailsMediaResponse> {
    try {
      return await this.widgetsService.addDetailsMedia(file);
    } catch (error) {
      handleError(error, 'addDetailsMedia');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('thumbnail')
  async addThumbnail(@UploadedFile() file: Express.Multer.File): Promise<AddThumbnailResponse> {
    try {
      return await this.widgetsService.addThumbnail(file);
    } catch (error) {
      handleError(error, 'addThumbnail');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('story')
  async addStoryMedia(@UploadedFile() file: Express.Multer.File): Promise<AddStoryMedia> {
    try {
      return await this.widgetsService.addStoryMedia(file);
    } catch (error) {
      handleError(error, 'addStoryMedia');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('authorAvatar')
  async addAuthorAvatar(@UploadedFile() file: Express.Multer.File): Promise<AddAuthorAvatarResponse> {
    try {
      return await this.widgetsService.addAuthorAvatar(file);
    } catch (error) {
      handleError(error, 'addAuthorAvatar');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Post('post')
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  async createWidget(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) body: CreateWidgetDto,
  ): Promise<Widget> {
    try {
      return await this.widgetsService.createWidget(body);
    } catch (error) {
      handleError(error, 'createWidget');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiForbiddenResponse({ description: ReasonPhrases.FORBIDDEN })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @Patch(':id')
  async editWidgets(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: EditWidgetDto,
  ): Promise<Widget> {
    try {
      return await this.widgetsService.editWidgets(id, body);
    } catch (error) {
      handleError(error, 'editWidgets');
    }
  }
}
