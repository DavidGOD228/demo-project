import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { phoneNumberRegex } from 'src/common/constants/constants';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(phoneNumberRegex)
  phoneNumber: string;
}

export class ConfirmUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(phoneNumberRegex)
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  verificationCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;
}

export class ConfirmAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(phoneNumberRegex)
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  verificationCode: string;
}
