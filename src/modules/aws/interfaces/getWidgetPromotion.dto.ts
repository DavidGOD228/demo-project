import { IsOptional, IsString } from 'class-validator';

export class GetWidgetPromotionDto {
  @IsOptional()
  @IsString()
  widgetId?: string;
}
