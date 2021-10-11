import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import TwilioSmsService from 'src/modules/twilio/services/twilio.service';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from '../interfaces/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,

    private readonly twilioService: TwilioSmsService,
  ) {}

  public async login(body: LoginDto): Promise<void> {
    const { phoneNumber } = body;

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
