import { IsNotEmpty, IsUUID } from 'class-validator';
import { DefaultMessages } from '../types/DefaultMessages';
import { ApiProperty } from '@nestjs/swagger';

export class GetOneDto {
  @ApiProperty()
  @IsNotEmpty({
    message: DefaultMessages.ID_PARAM_REQUIRED,
  })
  @IsUUID(4, {
    message: 'Parametro id deve ser um uuid',
  })
  id: string;
}
