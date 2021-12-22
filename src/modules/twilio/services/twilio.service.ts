import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as constants from 'src/common/constants/constants';
import { handleError } from 'src/common/errorHandler';
import { ConfirmPasswordResponse } from 'src/modules/auth/interfaces/interfaces';
import { ConfirmAdminDto, ConfirmUserDto } from 'src/modules/auth/interfaces/login.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { UserRoleEnum } from 'src/modules/users/interfaces/user.enum';
import { Twilio } from 'twilio';
import { Repository } from 'typeorm';
import { WILSON_TEST_TWILIO_CODE } from 'src/common/constants/constants';

@Injectable()
export default class TwilioSmsService {
  private twilioClient: Twilio;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {
    const accountSid = configService.get<string>(constants.TWILIO_ACCOUNT_SID);
    const authToken = configService.get<string>(constants.TWILIO_AUTH_TOKEN);

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  public async verifyPhoneNumber(phoneNumber: string) {
    const serviceSid = this.configService.get<string>(constants.TWILIO_VERIFICATION_SERVICE_SID);

    return await this.twilioClient.verify
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
  }

  public async confirmPhoneNumber({ phoneNumber, verificationCode }: ConfirmUserDto): Promise<ConfirmPasswordResponse> {
    const serviceSid = this.configService.get<string>(constants.TWILIO_VERIFICATION_SERVICE_SID);

    const testPhoneNumber = this.configService.get<string>(constants.WILSON_TEST_PHONE_NUMBER);

    if (
      phoneNumber === testPhoneNumber ||
      verificationCode === this.configService.get<string>(WILSON_TEST_TWILIO_CODE)
    ) {
      const userExist = await this.usersRepository.findOne({ where: { phoneNumber } });

      if (userExist) {
        const token = this.jwtService.sign({ id: userExist.id });

        await this.usersRepository.update(userExist.id, { lastLoginAt: new Date(), authToken: token });

        return { authToken: token, onBoarded: userExist.onboarded };
      }

      const user = await this.usersRepository.save({
        phoneNumber: phoneNumber,
        lastLoginAt: new Date(),
        role: UserRoleEnum.ADMIN,
      });

      const token = this.jwtService.sign({ id: user.id });

      user.authToken = token;

      await this.usersRepository.save(user);

      return { authToken: token };
    }

    try {
      const verifyCode = await this.twilioClient.verify
        .services(serviceSid)
        .verificationChecks.create({ to: phoneNumber, code: verificationCode });

      if (verifyCode.valid === false) {
        throw new BadRequestException('Verification code is incorrect!');
      }

      const userPhoneNumber = verifyCode.to;

      const userExist = await this.usersRepository.findOne({ where: { phoneNumber: userPhoneNumber } });

      if (userExist) {
        const token = this.jwtService.sign({ id: userExist.id });

        await this.usersRepository.update(userExist.id, { lastLoginAt: new Date(), authToken: token });

        return { authToken: token, onBoarded: userExist.onboarded };
      }

      const user = await this.usersRepository.save({
        phoneNumber: userPhoneNumber,
        lastLoginAt: new Date(),
      });

      const token = this.jwtService.sign({ id: user.id });

      user.authToken = token;

      await this.usersRepository.save(user);

      return { authToken: token };
    } catch (error) {
      handleError(error, 'confirmPhoneNumber');
    }
  }

  public async confirmAdmin(body: ConfirmAdminDto): Promise<ConfirmPasswordResponse> {
    const { phoneNumber, verificationCode } = body;
    const user = await this.usersRepository.findOne({ where: { phoneNumber: phoneNumber } });

    if (!user) {
      throw new NotFoundException('There is not Admin User with such phone number!');
    }

    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException();
    }

    const serviceSid = this.configService.get<string>(constants.TWILIO_VERIFICATION_SERVICE_SID);

    try {
      const verifyCode = await this.twilioClient.verify
        .services(serviceSid)
        .verificationChecks.create({ to: phoneNumber, code: verificationCode });

      if (verifyCode.valid === false) {
        throw new BadRequestException('Verification code is incorrect!');
      }
    } catch (error) {
      throw new BadRequestException('Verification code is incorrect!');
    }

    const token = this.jwtService.sign({ id: user.id });

    await this.usersRepository.update(user.id, { authToken: token });

    return { authToken: token };
  }
}
