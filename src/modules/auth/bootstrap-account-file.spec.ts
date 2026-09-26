import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  bootstrapAccountFilePath,
  readBootstrapAccount,
  writeBootstrapAccount,
  removeBootstrapAccount,
} from './bootstrap-account-file';

const logger = { log: jest.fn(), warn: jest.fn() };

describe('bootstrap account file', () => {
  let dir: string;
  const original = process.env.BOOTSTRAP_ACCOUNT_FILE;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'zap-bootacc-'));
    process.env.BOOTSTRAP_ACCOUNT_FILE = join(dir, '.admin-account');
    logger.log.mockClear();
    logger.warn.mockClear();
  });

  afterEach(() => {
    if (original === undefined) delete process.env.BOOTSTRAP_ACCOUNT_FILE;
    else process.env.BOOTSTRAP_ACCOUNT_FILE = original;
    rmSync(dir, { recursive: true, force: true });
  });

  describe('bootstrapAccountFilePath', () => {
    it('honours BOOTSTRAP_ACCOUNT_FILE', () => {
      expect(bootstrapAccountFilePath()).toBe(join(dir, '.admin-account'));
    });

    it('falls back to data/.admin-account under the working directory', () => {
      delete process.env.BOOTSTRAP_ACCOUNT_FILE;

      expect(bootstrapAccountFilePath()).toBe(join(process.cwd(), 'data', '.admin-account'));
    });
  });

  describe('readBootstrapAccount', () => {
    it('returns null when the file is absent', () => {
      expect(readBootstrapAccount(logger)).toBeNull();
    });

    it('returns null for an empty file', () => {
      writeFileSync(join(dir, '.admin-account'), '   \n');

      expect(readBootstrapAccount(logger)).toBeNull();
    });

    it('returns parsed account data from valid json', () => {
      writeFileSync(
        join(dir, '.admin-account'),
        JSON.stringify({ email: 'admin@zapturawa.com', password: 'secret-password' }),
      );

      expect(readBootstrapAccount(logger)).toEqual({
        email: 'admin@zapturawa.com',
        password: 'secret-password',
      });
    });

    it('returns null and logs warning when json is invalid', () => {
      writeFileSync(join(dir, '.admin-account'), 'not-json');

      expect(readBootstrapAccount(logger)).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to read admin account file'),
        expect.anything(),
      );
    });
  });

  describe('writeBootstrapAccount', () => {
    it('writes formatted json to the resolved path', () => {
      writeBootstrapAccount('admin@zapturawa.com', 'written-secret');

      const content = readFileSync(join(dir, '.admin-account'), 'utf-8');
      const parsed: unknown = JSON.parse(content);
      expect(parsed).toEqual({ email: 'admin@zapturawa.com', password: 'written-secret' });
    });
  });

  describe('removeBootstrapAccount', () => {
    it('removes the file and logs reason', () => {
      writeBootstrapAccount('admin@zapturawa.com', 'pass');
      expect(existsSync(join(dir, '.admin-account'))).toBe(true);

      removeBootstrapAccount('test removal', logger);

      expect(existsSync(join(dir, '.admin-account'))).toBe(false);
      expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('test removal'));
    });

    it('treats absent file as success without warning', () => {
      removeBootstrapAccount('already gone', logger);

      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
