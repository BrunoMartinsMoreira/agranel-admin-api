import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'A nova senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter no minimo 8 caracteres' })
  @MaxLength(32, { message: 'Senha deve ter no máximo 32 caracteres' })
  newPassword: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'A confirmação da nova senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter no minimo 8 caracteres' })
  @MaxLength(32, { message: 'Senha deve ter no máximo 32 caracteres' })
  confirmNewPassword: string;
}
