import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import TwilioSmsService from 'src/modules/twilio/services/twilio.service';
import { ConfirmPasswordResponse } from '../interfaces/interfaces';
import { ConfirmAdminDto, ConfirmUserDto, LoginDto } from '../interfaces/login.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly twilioService: TwilioSmsService) {}

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

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiCreatedResponse({ description: 'Created' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Post('/loginAdmin')
  async confirmAdmin(@Body() body: ConfirmAdminDto): Promise<ConfirmPasswordResponse> {
    try {
      return await this.twilioService.confirmAdmin(body);
    } catch (error) {
      console.log(error.message);
    }
  }
}
