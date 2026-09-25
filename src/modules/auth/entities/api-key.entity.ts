import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ApiKeyRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  keyHash!: string;

  // 12 to fit the 12-char prefix that auth.service writes (was varchar(8); harmless on the
  // hardcoded-SQLite `main` connection, but kept consistent with the code).
  @Column({ type: 'varchar', length: 12 })
  keyPrefix!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ApiKeyRole.USER,
  })
  role!: ApiKeyRole;

  @Column({ type: 'simple-array', nullable: true })
  allowedIps!: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  allowedSessions!: string[] | null;

  // Chat-level allowlist, independent of allowedSessions and the same fail-open semantic: NULL or
  // empty means "every chat". Entries are WhatsApp chat ids (a group `<id>@g.us`, a contact
  // `<phone>@c.us` / `<lid>@lid`, or a bare phone number). Enforced on the read surface and on
  // sends; see src/common/security/chat-scope.ts.
  @Column({ type: 'simple-array', nullable: true })
  allowedChats!: string[] | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'datetime', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastUsedAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  usageCount!: number;

  @Column({ type: 'varchar', length: 36, nullable: true })
  userId!: string | null;

  plan?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
