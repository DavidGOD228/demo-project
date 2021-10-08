import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { FilterUserOrderEnum } from './user.enum';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  birthdayDate?: Date;

  @ApiPropertyOptional()
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

export class FilterUserPagesDto {
  @ApiProperty()
  @IsNumber()
  limit: number;

  @ApiProperty()
  @IsNumber()
  page: number;

  @ApiProperty({ default: 'id' })
  @IsString()
  @IsOptional()
  fieldName?: string = 'id';

  @ApiProperty({ enum: FilterUserOrderEnum, default: FilterUserOrderEnum.ASC })
  @IsString()
  @IsOptional()
  order?: string = FilterUserOrderEnum.ASC;
}
