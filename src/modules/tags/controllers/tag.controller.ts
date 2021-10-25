import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  BaseApiAdminOkResponses,
  BaseApiCreatedResponses,
  BaseApiUserOkResponses,
} from 'src/common/decorators/baseApi.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { handleError } from 'src/common/errorHandler';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { UserRoleEnum } from 'src/modules/users/interfaces/user.enum';
import { Tag } from '../entities/tag.entity';
import { DeleteTagResponse } from '../interfaces';
import { CreateTagDto, DeleteTagFromWidget, TagNameFilterDto } from '../interfaces/tag.dto';
import { TagsService } from '../services/tag.service';

@ApiTags('Tags')
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiBearerAuth()
  @BaseApiUserOkResponses()
  @Get('/')
  async getAllTags() {
    try {
      return await this.tagsService.getAllTags();
    } catch (error) {
      handleError(error, 'getAllTags');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @Post('post')
  async addTag(@Body() name: CreateTagDto): Promise<Tag> {
    try {
      return await this.tagsService.addTag(name);
    } catch (error) {
      handleError(error, 'addTag');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiCreatedResponses()
  @Get('filteredTags')
  async getFilteredTags(@Query(new ValidationPipe()) values: TagNameFilterDto): Promise<Tag[]> {
    try {
      return await this.tagsService.getFilteredTags(values);
    } catch (error) {
      handleError(error, 'getFilteredTags');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth()
  @BaseApiAdminOkResponses()
  @Delete(':tagId')
  async deleteTagFromWidget(
    @Param('tagId', new ParseUUIDPipe({ version: '4' })) tagId: string,
    @Body(new ValidationPipe()) widgetId: DeleteTagFromWidget,
  ): Promise<DeleteTagResponse> {
    try {
      return await this.tagsService.deleteTagFromWidget(tagId, widgetId);
    } catch (error) {
      handleError(error, 'deleteTagFromWidget');
    }
  }
}
