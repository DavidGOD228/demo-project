import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
import TwilioSmsService from 'src/modules/twilio/services/twilio.service';
import { ConfirmPasswordResponse } from '../interfaces/interfaces';
import { ConfirmAdminDto, ConfirmUserDto, LoginDto } from '../interfaces/login.dto';
import { AuthService } from '../services/auth.service';
import { handleError } from '../../../common/errorHandler';
import { SentryInterceptor } from '../../../common/interceptors';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequestWithUserParams } from 'src/common/interfaces';

@UseInterceptors(SentryInterceptor)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly twilioService: TwilioSmsService) {}

  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @Post('/login')
  async login(@Body() body: LoginDto) {
    try {
      return await this.authService.login(body);
    } catch (error) {
      handleError(error, 'login');
    }
  }

  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @Post('/confirmUser')
  async confirmUser(@Body() body: ConfirmUserDto): Promise<ConfirmPasswordResponse> {
    try {
      return await this.twilioService.confirmPhoneNumber(body);
    } catch (error) {
      handleError(error, 'confirmUser');
    }
  }

  @ApiCreatedResponse({ description: ReasonPhrases.CREATED })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @Post('/loginAdmin')
  async confirmAdmin(@Body() body: ConfirmAdminDto): Promise<ConfirmPasswordResponse> {
    try {
      return await this.twilioService.confirmAdmin(body);
    } catch (error) {
      handleError(error, 'confirmAdmin');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiUnauthorizedResponse({ description: ReasonPhrases.UNAUTHORIZED })
  @ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND })
  @Get('/logout')
  async logout(@Req() req: RequestWithUserParams): Promise<void> {
    try {
      return await this.authService.logout(req.user.id);
    } catch (error) {
      handleError(error, 'logout');
    }
  }
}
