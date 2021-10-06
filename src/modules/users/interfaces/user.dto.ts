import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { FilterUserOrderEnum } from './user.enum';

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

export class PromotionsFilterDto {
  @ApiProperty()
  @IsNumber()
  limit: number;

  @ApiProperty()
  @IsNumber()
  pageNumber: number;
}
