import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFICATION_SERVICE_SID } from 'src/common/constants/constants';
import { ConfirmPasswordResponse } from 'src/modules/auth/interfaces/interfaces';
import { ConfirmUserDto } from 'src/modules/auth/interfaces/login.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { Twilio } from 'twilio';
import { Repository } from 'typeorm';

@Injectable()
export default class TwilioSmsService {
  private twilioClient: Twilio;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {
    const accountSid = configService.get<string>(TWILIO_ACCOUNT_SID);
    const authToken = configService.get<string>(TWILIO_AUTH_TOKEN);

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  public async verifyPhoneNumber(phoneNumber: string) {
    const serviceSid = this.configService.get<string>(TWILIO_VERIFICATION_SERVICE_SID);

    return await this.twilioClient.verify
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
  }

  public async confirmPhoneNumber(body: ConfirmUserDto): Promise<ConfirmPasswordResponse> {
    const { phoneNumber, verificationCode, location } = body;
    const serviceSid = this.configService.get<string>(TWILIO_VERIFICATION_SERVICE_SID);

    try {
      await this.twilioClient.verify
        .services(serviceSid)
        .verificationChecks.create({ to: phoneNumber, code: verificationCode });
    } catch (error) {
      throw new BadRequestException('Verification code is incorrect!');
    }

    const userExist = await this.usersRepository.findOne({ where: { phoneNumber: phoneNumber } });
    if (userExist) {
      await this.usersRepository.update(userExist.id, { lastLoginAt: new Date() });
      const token = this.jwtService.sign({ id: userExist.id });
      return { authToken: token };
    }

    const user = this.usersRepository.create({ phoneNumber: phoneNumber, lastLoginAt: new Date(), location: location });
    await this.usersRepository.save(user);
    const token = this.jwtService.sign({ id: user.id });
    return { authToken: token };
  }
}
