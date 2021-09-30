import { Injectable } from '@nestjs/common';
import TwilioSmsService from 'src/modules/twilio/services/twilio.service';
import { LoginDto } from '../interfaces/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly twilioService: TwilioSmsService) {}

  public async login(body: LoginDto): Promise<void> {
    const { phoneNumber } = body;

    await this.twilioService.verifyPhoneNumber(phoneNumber);
  }
}
