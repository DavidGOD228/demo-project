import { Body, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RequestWithUserParams } from 'src/common/interfaces';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { UsersWithFiltersResponse } from '../interfaces';
import { FilterUserPagesDto, UpdateProfileDto } from '../interfaces/user.dto';
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
  @Get('/all')
  async getUsersWithFilters(@Query() filterByPages: FilterUserPagesDto): Promise<UsersWithFiltersResponse> {
    try {
      return await this.usersService.getUsersWithFilters(filterByPages);
    } catch (error) {
      console.log(error);
    }
  }
}
