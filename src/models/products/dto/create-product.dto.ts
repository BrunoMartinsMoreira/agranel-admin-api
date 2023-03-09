import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ProductCategory } from 'src/common/types/enums/ProductCategoryEnum';

export class CreateProductDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Nome é um campo obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  readonly name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Nome é um campo obrigatório' })
  @IsIn(
    [
      ProductCategory.CHAS,
      ProductCategory.FARINHAS,
      ProductCategory.FRUTAS_DESIDRATADAS,
      ProductCategory.OLEAGINOSAS,
      ProductCategory.SEMENTES,
      ProductCategory.TEMPEROS,
      ProductCategory.OUTROS,
    ],
    { message: 'Envie uma categoria de produto válida' },
  )
  readonly category: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Preco de custo é um campo obrigatório' })
  @IsNumber({}, { message: 'Preco de custo deve ser um número' })
  readonly costPrice: number;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Preco de venda é um campo obrigatório' })
  @IsNumber({}, { message: 'Preco de venda deve ser um número' })
  readonly salePrice: number;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Margem de lucro é um campo obrigatório' })
  @IsNumber({}, { message: 'Margem de lucro deve ser um número' })
  readonly profitMargin: number;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Quantidade em estoque é um campo obrigatório' })
  @IsNumber({}, { message: 'Quantidade em estoque deve ser um número' })
  readonly stockQuantity: number;
}
