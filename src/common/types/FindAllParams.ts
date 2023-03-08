import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FindAllParams {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'O parametro take deve ser um número' })
  @Min(1, { message: 'O parametro take deve ser no mínimo 1' })
  @Type(() => Number)
  take?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'O parametro page deve ser um número' })
  @Min(1, { message: 'O parametro page deve ser no mínimo 1' })
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  search?: string;
}
