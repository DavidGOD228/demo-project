import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';
import TwilioSmsService from 'src/modules/twilio/services/twilio.service';
import { ConfirmPasswordResponse } from '../interfaces/interfaces';
import { ConfirmUserDto, LoginDto } from '../interfaces/login.dto';
import { AuthService } from '../services/auth.service';
import { handleError } from '../../../common/errorHandler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly twilioService: TwilioSmsService) {}

  @ApiOkResponse({ description: ReasonPhrases.OK })
  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @Post('/login')
  async login(@Body() body: LoginDto): Promise<void> {
    try {
      return await this.authService.login(body);
    } catch (error) {
      handleError(error, 'login');
    }
  }

  @ApiBadRequestResponse({ description: ReasonPhrases.BAD_REQUEST })
  @ApiOkResponse({ description: ReasonPhrases.OK })
  @Post('/confirmUser')
  async confirmUser(@Body() body: ConfirmUserDto): Promise<ConfirmPasswordResponse> {
    try {
      return await this.twilioService.confirmPhoneNumber(body);
    } catch (error) {
      handleError(error, 'confirmUser');
    }
  }
}
