import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { FindAllParams } from 'src/common/types/FindAllParams';

export class FindAllUsersDto extends FindAllParams {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Campo nome deve ser uma string' })
  name?: string;
}
