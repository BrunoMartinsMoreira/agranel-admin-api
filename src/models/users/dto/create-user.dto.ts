import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Campo nome é obrigatório' })
  @IsString({ message: 'Campo nome deve ser uma string' })
  readonly name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsEmail({}, { message: 'Envie um e-mail válido' })
  readonly email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Campo senha é obrigatório' })
  @IsString({ message: 'Campo senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter no minimo 8 caracteres' })
  @MaxLength(32, { message: 'Senha deve ter no máximo 32 caracteres' })
  readonly password: string;
}
