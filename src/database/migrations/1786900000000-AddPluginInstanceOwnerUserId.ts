import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPluginInstanceOwnerUserId1786900000000 implements MigrationInterface {
  name = 'AddPluginInstanceOwnerUserId1786900000000';

  private async hasColumn(queryRunner: QueryRunner, name: string): Promise<boolean> {
    if (queryRunner.connection.options.type === 'postgres') {
      const rows = (await queryRunner.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = current_schema() AND table_name = 'plugin_instances' AND column_name = '${name}'`,
      )) as unknown[];
      return rows.length > 0;
    }
    const rows = (await queryRunner.query(`PRAGMA table_info("plugin_instances")`)) as Array<{ name: string }>;
    return rows.some(r => r.name === name);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasColumn(queryRunner, 'ownerUserId'))) {
      await queryRunner.query(`ALTER TABLE "plugin_instances" ADD COLUMN "ownerUserId" varchar(36)`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await this.hasColumn(queryRunner, 'ownerUserId')) {
      await queryRunner.query(`ALTER TABLE "plugin_instances" DROP COLUMN "ownerUserId"`);
    }
  }
}
