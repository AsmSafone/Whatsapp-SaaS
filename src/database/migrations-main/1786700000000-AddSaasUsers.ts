import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSaasUsers1786700000000 implements MigrationInterface {
  name = 'AddSaasUsers1786700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "users" (` +
        `"id" varchar PRIMARY KEY NOT NULL, ` +
        `"name" varchar(120) NOT NULL, ` +
        `"email" varchar(190) NOT NULL, ` +
        `"passwordHash" varchar(255) NOT NULL, ` +
        `"plan" varchar(20) NOT NULL DEFAULT ('starter'), ` +
        `"createdAt" datetime NOT NULL DEFAULT (datetime('now')), ` +
        `"updatedAt" datetime NOT NULL DEFAULT (datetime('now'))` +
        `)`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")`);

    const apiKeyCols = (await queryRunner.query(`PRAGMA table_info("api_keys")`)) as Array<{ name: string }>;
    if (!apiKeyCols.some(c => c.name === 'userId')) {
      await queryRunner.query(`ALTER TABLE "api_keys" ADD COLUMN "userId" varchar(36)`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const apiKeyCols = (await queryRunner.query(`PRAGMA table_info("api_keys")`)) as Array<{ name: string }>;
    if (apiKeyCols.some(c => c.name === 'userId')) {
      await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN "userId"`);
    }
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
