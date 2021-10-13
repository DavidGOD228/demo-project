import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsMilitaryTime,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { FilterWidgetOrderEnum, StoryBlockTypeEnum, WidgetStatusEnum } from './widget.enum';

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundColor?: string;

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
  canBeLiked: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  hasCountdown: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  hasExpiration: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({ enum: WidgetStatusEnum })
  status: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expirationDate?: string;

  @ApiProperty()
  @IsMilitaryTime()
  startTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMilitaryTime()
  expirationTime?: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  channelIds: string[];

  @ApiProperty()
  @IsString()
  feedButtonText: string;

  @ApiProperty()
  @IsString()
  feedButtonColor: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailsButtonText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailsButtonColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storyAuthorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storyAuthorAvatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storyDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  retailPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discountedPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promotionButtonText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promotionButtonColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promotionMediaUrl?: string;

  @ApiProperty()
  @IsString()
  feedMediaUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailsMediaUrl?: string;

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
  @Min(1)
  limit: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  @Min(1)
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
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filteringType?: string[];
}

export class EditWidgetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isExclusive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canBeShared?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  canBeLiked?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  hasCountdown?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasExpiration?: boolean;

  @ApiPropertyOptional({ enum: WidgetStatusEnum })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expirationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMilitaryTime()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMilitaryTime()
  expirationTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  channelIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedButtonText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedButtonColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailsButtonText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailsButtonColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storyAuthorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storyAuthorAvatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storyDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  retailPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discountedPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promotionButtonText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promotionButtonColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promotionMediaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedMediaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detailsMediaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsArray()
  @IsOptional()
  @Type(() => AddStoryBlockToWidget)
  @ValidateNested({ each: true })
  storiesToAdd?: AddStoryBlockToWidget[];
}
