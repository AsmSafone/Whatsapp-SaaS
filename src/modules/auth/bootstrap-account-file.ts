import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { writeSecretFile } from '../../common/utils/secret-file';
import type { LoggerService } from '../../common/services/logger.service';

export interface BootstrapAccountData {
  email: string;
  password?: string;
}

export function bootstrapAccountFilePath(): string {
  return process.env.BOOTSTRAP_ACCOUNT_FILE || join(process.cwd(), 'data', '.admin-account');
}

export function readBootstrapAccount(logger: Pick<LoggerService, 'warn'>): BootstrapAccountData | null {
  const file = bootstrapAccountFilePath();
  if (!existsSync(file)) return null;
  try {
    const raw = readFileSync(file, 'utf-8').trim();
    if (!raw) return null;
    return JSON.parse(raw) as BootstrapAccountData;
  } catch (error) {
    logger.warn(`Failed to read admin account file: ${file}`, { error: String(error) });
    return null;
  }
}

export function writeBootstrapAccount(email: string, password: string): void {
  const content = JSON.stringify({ email, password }, null, 2);
  writeSecretFile(bootstrapAccountFilePath(), content);
}

export function removeBootstrapAccount(reason: string, logger: Pick<LoggerService, 'log' | 'warn'>): void {
  const file = bootstrapAccountFilePath();
  try {
    unlinkSync(file);
    logger.log(`Removed stale admin account file (${reason}): ${file}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    logger.warn(`Failed to remove stale admin account file: ${file}`, { error: String(error) });
  }
}
