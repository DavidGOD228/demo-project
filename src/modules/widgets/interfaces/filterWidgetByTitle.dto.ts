import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterWidgetByTitleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filterValue: string;
}
