import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { FilterWidgetOrderEnum, StoryBlockTypeEnum } from './widget.enum';

export class CreateWidgetDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  backgroundColor: string;

  @ApiProperty()
  @IsString()
  websiteUrl: string;

  @ApiProperty()
  @IsBoolean()
  isExclusive: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  canBeShared: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  hasExpiration: boolean;

  @ApiPropertyOptional()
  tagIds?: string[];

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expirationTime?: string;

  @ApiProperty()
  channelIds: string[];

  @ApiProperty()
  @IsString()
  feedButtonText: string;

  @ApiProperty()
  @IsString()
  feedButtonColor: string;

  @ApiProperty()
  @IsString()
  detailsButtonText: string;

  @ApiProperty()
  @IsString()
  detailsButtonColor: string;

  @ApiProperty()
  @IsString()
  retailPrice: string;

  @ApiProperty()
  @IsString()
  discount: string;

  @ApiProperty()
  @IsString()
  discountedPrice: string;

  @ApiProperty()
  @IsString()
  promotionButtonText: string;

  @ApiProperty()
  @IsString()
  promotionButtonColor: string;

  @ApiProperty()
  @IsString()
  promotionMediaUrl: string;

  @ApiProperty()
  @IsString()
  feedMediaUrl: string;

  @ApiProperty()
  @IsString()
  detailsMediaUrl: string;

  @ApiProperty()
  @IsString()
  thumbnailUrl: string;

  @IsArray()
  @IsOptional()
  @Type(() => AddStoryBlockToWidget)
  @ValidateNested({ each: true })
  storiesToAdd?: AddStoryBlockToWidget[];
}

export class AddStoryBlockToWidget {
  @ApiProperty()
  @IsString()
  assetUrl: string;

  @ApiProperty()
  @IsString()
  swipeUrl: string;

  @ApiProperty({ enum: StoryBlockTypeEnum })
  type: string;

  @ApiProperty()
  @IsString()
  priority: number;
}

export class FilterWidgetsDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  limit: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  pageNumber: number;

  @ApiPropertyOptional({ default: 'title' })
  @IsString()
  @IsOptional()
  fieldName?: string = 'title';

  @ApiPropertyOptional({ enum: FilterWidgetOrderEnum, default: FilterWidgetOrderEnum.ASC })
  @IsString()
  @IsOptional()
  order?: string = FilterWidgetOrderEnum.ASC;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  filteringType?: string[];
}

export class EditWidgetDto {
  @ApiPropertyOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  isExclusive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  canBeShared?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  hasExpiration?: boolean;

  @ApiPropertyOptional()
  tagIds?: string[];

  @ApiPropertyOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiPropertyOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expirationTime?: string;

  @ApiPropertyOptional()
  channelIds?: string[];

  @ApiPropertyOptional()
  @IsString()
  feedButtonText?: string;

  @ApiPropertyOptional()
  @IsString()
  feedButtonColor?: string;

  @ApiPropertyOptional()
  @IsString()
  detailsButtonText?: string;

  @ApiPropertyOptional()
  @IsString()
  detailsButtonColor?: string;

  @ApiPropertyOptional()
  @IsString()
  retailPrice?: string;

  @ApiPropertyOptional()
  @IsString()
  discount?: string;

  @ApiPropertyOptional()
  @IsString()
  discountedPrice?: string;

  @ApiPropertyOptional()
  @IsString()
  promotionButtonText?: string;

  @ApiPropertyOptional()
  @IsString()
  promotionButtonColor?: string;

  @ApiPropertyOptional()
  @IsString()
  promotionMediaUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  feedMediaUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  detailsMediaUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsArray()
  @IsOptional()
  @Type(() => AddStoryBlockToWidget)
  @ValidateNested({ each: true })
  storiesToAdd?: AddStoryBlockToWidget[];
}
