import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FilterTagsNameDto {
  @ApiProperty()
  @IsString()
  filterValue: string;
}

export class DeleteTagFromWidget {
  @ApiProperty()
  @IsString()
  widgetId: string;
}

export class CreateTagDto {
  @ApiProperty()
  @IsString()
  name: string;
}
