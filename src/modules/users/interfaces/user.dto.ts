import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Length, Min, IsInt } from 'class-validator';
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
  @IsString()
  @IsOptional()
  location?: string;

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
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  pageNumber: number;

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
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  pageNumber: number;
}

export class PromotionsFilterDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  pageNumber: number;
}
