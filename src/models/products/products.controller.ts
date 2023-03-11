import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DefaultErrorHandler } from 'src/common/utils/defaultErrorHandler';
import { FindAllProductsDto } from './dto/Find-all-products.dto';
import { ILike } from 'typeorm';
import { Response } from 'express';
import { GenerateOrderDto } from './dto/generate-order.dto';
import { Public } from 'src/auth/isPublic';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      return this.productsService.store(createProductDto, true, [
        {
          columnName: 'name',
          value: { name: createProductDto.name },
        },
        {
          columnName: 'productCode',
          value: { productCode: createProductDto.productCode },
        },
      ]);
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Get()
  async findAll(@Query() query: FindAllProductsDto) {
    try {
      return this.productsService.getAll({
        take: query?.take,
        page: query.page,
        order: { name: 'ASC' },
        where: {
          name: query.name ? ILike(`%${query.name}%`) : undefined,
          productCode: query.productCode ?? undefined,
          category: query.category ?? undefined,
        },
      });
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Get('low-stock')
  async getWithLowStock(@Query() query: FindAllProductsDto) {
    try {
      return this.productsService.getProductsWithLowStockQuantity(query);
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Public()
  @Post('generate-order')
  async generateOrder(
    @Body() generateOrderDto: GenerateOrderDto,
    @Res() res: Response,
  ) {
    try {
      const filePath = await this.productsService.generateExcelOrderFile(
        generateOrderDto,
      );

      res.sendFile(filePath, {}, async () => {
        await this.productsService.deleteFile(filePath);
      });
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return this.productsService.show({
        where: { id },
      });
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      return this.productsService.update({
        condition: { id },
        body: updateProductDto,
      });
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return this.productsService.destroy(id);
    } catch (error) {
      return DefaultErrorHandler(error);
    }
  }
}
