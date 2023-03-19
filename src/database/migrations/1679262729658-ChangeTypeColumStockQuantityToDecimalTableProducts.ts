import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTypeColumStockQuantityToDecimalTableProducts1679262729658
  implements MigrationInterface
{
  name = 'ChangeTypeColumStockQuantityToDecimalTableProducts1679262729658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "stockQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "stockQuantity" numeric(10,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "stockQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "stockQuantity" integer NOT NULL`,
    );
  }
}
