import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterColumnStockQuantityTableProductsToInt1678559082271
  implements MigrationInterface
{
  name = 'AlterColumnStockQuantityTableProductsToInt1678559082271';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "stockQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "stockQuantity" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "stockQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "stockQuantity" numeric(10,2) NOT NULL`,
    );
  }
}
