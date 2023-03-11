import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultMessages } from 'src/common/types/DefaultMessages';
import { IDefaultResponse } from 'src/common/types/DefaultResponse';
import { Pagination } from 'src/common/types/Pagination';
import { ServiceBase } from 'src/common/utils/service.base';
import { Repository } from 'typeorm';
import { FindAllProductsDto } from './dto/Find-all-products.dto';
import { Product } from './entities/product.entity';
import * as fs from 'fs';

import * as path from 'path';
import * as Exceljs from 'exceljs';
import { GenerateOrderDto, Order } from './dto/generate-order.dto';

@Injectable()
export class ProductsService extends ServiceBase<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {
    super(productsRepository);
  }

  async getProductsWithLowStockQuantity({
    stockQuantity,
    category,
  }: FindAllProductsDto): Promise<IDefaultResponse<Pagination<Product>>> {
    let query = this.productsRepository
      .createQueryBuilder('product')
      .where('product.stockQuantity <= :stockQuantity', { stockQuantity });

    query = category
      ? query.andWhere('product.category = :category', { category })
      : query;

    const [products, rows] = await query
      .orderBy('stockQuantity', 'ASC', 'NULLS LAST')
      .getManyAndCount();

    return {
      error: false,
      message: [DefaultMessages.QUERY_SUCCESS],
      data: {
        count: rows,
        rows: products,
      },
    };
  }

  async generateExcelOrderFile(generateOrderDto: GenerateOrderDto) {
    const orders: Order[] = generateOrderDto.order;

    const workbook = new Exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.columns = [
      { header: 'PRODUTOS', key: 'name', width: 50 },
      { header: 'UNID.', key: 'kg', width: 10 },
      { header: 'QUANT.', key: 'quantity', width: 20 },
      { header: 'UNIT.', key: 'unit', width: 10 },
      {
        header: 'Total',
        width: 15,
        key: 'total',
        style: { numFmt: 'R$#,##0.00;[Red]-R$#,##0.00' },
      },
    ];

    orders.forEach((order) => {
      worksheet.addRow({
        name: order.name,
        kg: 'KG',
        quantity: order.quantity,
        unit: '',
        total: 0,
      });
    });

    const dateString = new Date()
      .toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
      .replace(/(\w+) (\d+)/, '_$1_$2');

    const fileName = `pedido_${dateString}.xlsx`;

    const filePath = path.join(__dirname, fileName);

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  async deleteFile(filePath: string) {
    return fs.unlinkSync(filePath);
  }
}
