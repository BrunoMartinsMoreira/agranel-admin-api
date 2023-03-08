import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refresh_token: string;

  @ApiProperty()
  @IsUUID()
  userId: string;
}
