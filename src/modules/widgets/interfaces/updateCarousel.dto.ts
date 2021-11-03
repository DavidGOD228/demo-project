import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WidgetStatusEnum } from './widget.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

class AddToCarouselWidget {
  @IsUUID('4')
  id: string;

  @IsString()
  carouselTitle: string;

  @IsInt()
  carouselPriority: number;
}

export class UpdateCarouselDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isExclusive?: boolean;

  @ApiPropertyOptional()
  @IsEnum(WidgetStatusEnum)
  @IsString()
  status?: WidgetStatusEnum;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  @Type(() => AddToCarouselWidget)
  @ValidateNested({ each: true })
  widgetsToAdd?: AddToCarouselWidget[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  @IsUUID(4, { each: true })
  widgetsToRemove?: string[];
}
