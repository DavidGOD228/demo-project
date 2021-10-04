import { IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignWinnersDto {
  @IsUUID('4')
  widgetId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @Type(() => String)
  winners: string[];
}
