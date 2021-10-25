import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { GetSubmissionsWinnersEnum, SubmissionsFilterTypeEnum } from './index';
import { FilterWidgetOrderEnum } from '../../widgets/interfaces/widget.enum';

export class GetFeedSubmissionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fieldName?: SubmissionsFilterTypeEnum;

  @ApiPropertyOptional({ enum: FilterWidgetOrderEnum, default: FilterWidgetOrderEnum.ASC })
  @IsString()
  @IsOptional()
  order?: FilterWidgetOrderEnum = FilterWidgetOrderEnum.ASC;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filteringType?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filteringTitle?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  filteringWinner?: GetSubmissionsWinnersEnum[];

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
