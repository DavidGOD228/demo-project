import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import TwilioSmsService from 'src/modules/twilio/services/twilio.service';
import { ConfirmPasswordResponse } from '../interfaces/interfaces';
import { ConfirmUserDto, LoginDto } from '../interfaces/login.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly twilioService: TwilioSmsService) {}

  @ApiTags('Auth')
  @ApiOkResponse({ description: 'OK' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Post('/login')
  async login(@Body() body: LoginDto): Promise<void> {
    try {
      return await this.authService.login(body);
    } catch (error) {
      console.log(error.message);
    }
  }

  @ApiTags('Auth')
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse({ description: 'OK' })
  @Post('/confirmUser')
  async confirmUser(@Body() body: ConfirmUserDto): Promise<ConfirmPasswordResponse> {
    try {
      return await this.twilioService.confirmPhoneNumber(body);
    } catch (error) {
      console.log(error.message);
    }
  }
}
