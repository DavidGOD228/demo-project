import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetWidgetPromotionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  widgetId?: string;
}
