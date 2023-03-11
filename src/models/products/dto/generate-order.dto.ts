import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateOrderDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  order: Order[];
}

export class Order {
  @ApiProperty({ required: true })
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  quantity: string;
}
