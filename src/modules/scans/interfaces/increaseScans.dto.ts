import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class IncreaseScansDto {
  @ApiProperty()
  @IsArray()
  @Type(() => String)
  widgetIds: string[];

  @ApiProperty()
  @IsString()
  channelId: string;
}
