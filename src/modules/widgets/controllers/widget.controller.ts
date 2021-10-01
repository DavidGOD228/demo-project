import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
  ApiCreatedResponse,
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
  AddThumbnailResponse,
  FilteredWidgetsResponse,
} from '../interfaces';
import { CreateWidgetDto, EditWidgetDto, FilterWidgetsDto } from '../interfaces/widget.dto';
import { WidgetService } from '../services/widget.service';

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
  ): Promise<FilteredWidgetsResponse[]> {
    try {
      return await this.widgetsService.getFilteredWidgets(filterWidgets);
    } catch (error) {
      console.log(error.message);
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @Get('exportCsv')
  async exportWidgetCsv(@Query() filterWidgets: FilterWidgetsDto): Promise<string> {
    try {
      return await this.widgetsService.exportWidgetCsv(filterWidgets);
    } catch (error) {
      console.log(error.message);
    }
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  async getWidgetById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<Widget> {
    try {
      return await this.widgetsService.getWidgetById(id);
    } catch (error) {
      console.log(error.message);
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('feedMedia')
  async addFeedMedia(@UploadedFile() file: Express.Multer.File): Promise<AddFeedMediaResponse> {
    try {
      return await this.widgetsService.addFeedMedia(file);
    } catch (error) {
      console.log(error.message);
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('detailsMedia')
  async addDetailsMedia(@UploadedFile() file: Express.Multer.File): Promise<AddDetailsMediaResponse> {
    try {
      return await this.widgetsService.addDetailsMedia(file);
    } catch (error) {
      console.log(error.message);
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @UseInterceptors(FileInterceptor('file'))
  @Post('thumbnail')
  async addThumbnail(@UploadedFile() file: Express.Multer.File): Promise<AddThumbnailResponse> {
    try {
      return await this.widgetsService.addThumbnail(file);
    } catch (error) {
      console.log(error.message);
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Post('post')
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiForbiddenResponse({ description: ReasonPhrases.FORBIDDEN })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  async createWidget(@Body() body: CreateWidgetDto): Promise<Widget> {
    try {
      return await this.widgetsService.createWidget(body);
    } catch (error) {
      console.log(error.message);
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
      console.log(error.message);
    }
  }
}
