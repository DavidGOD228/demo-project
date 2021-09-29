import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddToCarouselWidget {
  @IsUUID('4')
  id: string;

  @IsString()
  carouselTitle: string;

  @IsInt()
  carouselPriority: number;
}

export class UpdateCarouselDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  exclusive?: boolean;

  @IsArray()
  @IsOptional()
  @Type(() => AddToCarouselWidget)
  @ValidateNested({ each: true })
  addToCarousel?: AddToCarouselWidget[];

  @IsArray()
  @IsOptional()
  @IsUUID(4, { each: true })
  removeFromCarousel?: string[];
}
