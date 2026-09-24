import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionOwnerUserId1786800000000 implements MigrationInterface {
  name = 'AddSessionOwnerUserId1786800000000';

  private async hasColumn(queryRunner: QueryRunner, name: string): Promise<boolean> {
    if (queryRunner.connection.options.type === 'postgres') {
      const rows = (await queryRunner.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = current_schema() AND table_name = 'sessions' AND column_name = '${name}'`,
      )) as unknown[];
      return rows.length > 0;
    }
    const rows = (await queryRunner.query(`PRAGMA table_info("sessions")`)) as Array<{ name: string }>;
    return rows.some(r => r.name === name);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasColumn(queryRunner, 'ownerUserId'))) {
      await queryRunner.query(`ALTER TABLE "sessions" ADD COLUMN "ownerUserId" varchar(36)`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await this.hasColumn(queryRunner, 'ownerUserId')) {
      await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "ownerUserId"`);
    }
  }
}
