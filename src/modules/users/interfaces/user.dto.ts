import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, Length } from 'class-validator';
import { FilterUserOrderEnum } from './user.enum';

const MIN_EMAIL_LENGTH = 3;
const MAX_EMAIL_LENGTH = 254;

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
  @Length(MIN_EMAIL_LENGTH, MAX_EMAIL_LENGTH)
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  birthDate?: Date;

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

export class LikesFilterDto {
  @ApiProperty()
  @IsNumber()
  limit: number;

  @ApiProperty()
  @IsNumber()
  pageNumber: number;
}

export class PromotionsFilterDto {
  @ApiProperty()
  @IsNumber()
  limit: number;

  @ApiProperty()
  @IsNumber()
  pageNumber: number;
}
