import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SubmissionsFilterTypeEnum } from './index';

export class GetFeedSubmissionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filterType?: SubmissionsFilterTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  filterValue?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  pageNumber?: number;
}
