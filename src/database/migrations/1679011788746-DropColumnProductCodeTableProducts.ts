import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropColumnProductCodeTableProducts1679011788746
  implements MigrationInterface
{
  name = 'DropColumnProductCodeTableProducts1679011788746';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "productCode"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "productCode" character varying NOT NULL`,
    );
  }
}
