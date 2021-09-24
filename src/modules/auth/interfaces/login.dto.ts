import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/)
  phoneNumber: string;
}

export class ConfirmUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/)
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
