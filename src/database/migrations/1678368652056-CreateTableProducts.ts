import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableProducts1678368652056 implements MigrationInterface {
  name = 'CreateTableProducts1678368652056';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."products_category_enum" AS ENUM('temperos', 'chas', 'oleaginosas', 'farinhas', 'sementes', 'frutas_desidratadas', 'outros')`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "category" "public"."products_category_enum" NOT NULL, "costPrice" numeric(10,2) NOT NULL, "salePrice" numeric(10,2) NOT NULL, "profitMargin" numeric(10,2) NOT NULL, "stockQuantity" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."products_category_enum"`);
  }
}
