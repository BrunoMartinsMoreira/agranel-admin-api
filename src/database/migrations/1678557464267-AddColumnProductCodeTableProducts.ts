import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnProductCodeTableProducts1678557464267
  implements MigrationInterface
{
  name = 'AddColumnProductCodeTableProducts1678557464267';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "productCode" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "productCode"`);
  }
}
