import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  exclusiveSubscription?: boolean;
}

export class UpdateUserInterestsDto {
  @ApiProperty()
  interestsIds: string[];
}

export class ChangeUserOnBoardedStatusDto {
  @ApiProperty()
  @IsBoolean()
  onboarded: boolean;
}

export class AddUserFavoriteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  widgetId: string;

  @ApiProperty()
  @IsBoolean()
  likeExist: boolean;
}
