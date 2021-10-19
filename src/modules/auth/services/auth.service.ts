import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import TwilioSmsService from 'src/modules/twilio/services/twilio.service';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from '../interfaces/login.dto';
import * as constants from 'src/common/constants/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,

    private readonly configService: ConfigService,

    private readonly twilioService: TwilioSmsService,
  ) {}

  public async login({ phoneNumber }: LoginDto) {
    const testPhoneNumber = this.configService.get<string>(constants.WILSON_TEST_PHONE_NUMBER);

    if (phoneNumber === testPhoneNumber) {
      return { message: 'Phone number successfully confirmed!' };
    }

    await this.twilioService.verifyPhoneNumber(phoneNumber);
  }

  public async logout(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    user.authToken = null;
    await this.usersRepository.save(user);
  }
}
