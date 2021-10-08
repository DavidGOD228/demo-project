import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPromotionsDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  promotionIds: string[];
}
