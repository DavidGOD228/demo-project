import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class TagNameFilterDto {
  @ApiProperty()
  @IsString()
  filterValue: string;
}

export class DeleteTagFromWidget {
  @ApiProperty()
  @IsUUID()
  widgetId: string;
}

export class CreateTagDto {
  @ApiProperty()
  @IsString()
  name: string;
}
