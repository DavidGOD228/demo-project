import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsNumber } from 'class-validator';
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
