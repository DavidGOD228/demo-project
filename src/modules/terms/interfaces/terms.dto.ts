import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TermsTypeEnum } from './interfaces';

export class CreateTermDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mainText: string;
}

export class GetTermsDto {
  @ApiProperty()
  @IsEnum(TermsTypeEnum)
  type: TermsTypeEnum;
}
