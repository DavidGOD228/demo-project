import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetWidgetFeedDto {
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) => value.split(',').filter(v => !!v))
  tags: string[];
}
