import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { ProductCategory } from 'src/common/types/enums/ProductCategoryEnum';
import { FindAllParams } from 'src/common/types/FindAllParams';

export class FindAllProductsDto extends FindAllParams {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Campo nome deve ser uma string' })
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Campo Codigo do produto deve ser uma string' })
  productCode?: string;

  @ApiProperty({ required: true })
  @IsOptional()
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
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade em estoque deve ser um numero' })
  @Type(() => Number)
  stockQuantity?: number;
}
