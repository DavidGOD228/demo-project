import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterWidgetByTitleDto {
  @ApiProperty()
  @IsString()
  filterValue: string;
}
