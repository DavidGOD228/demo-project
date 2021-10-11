import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TagNameFilterDto {
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
