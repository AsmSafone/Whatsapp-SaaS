import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccountService, resolveDefaultAdminEmail, resolveDefaultAdminPassword } from './account.service';
import { User } from './entities/user.entity';
import { ApiKey, ApiKeyRole } from './entities/api-key.entity';
import { Session } from '../session/entities/session.entity';
import { hashPassword, signUserToken } from './user-token';

describe('AccountService', () => {
  let service: AccountService;
  let usersRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let sessionsRepo: Partial<Record<keyof Repository<Session>, jest.Mock>>;
  let apiKeysRepo: Partial<Record<keyof Repository<ApiKey>, jest.Mock>>;

  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    usersRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(
        (dto: Partial<User>): User =>
          ({ id: 'user-uuid-1', createdAt: new Date(), updatedAt: new Date(), ...dto }) as User,
      ),
      count: jest.fn(),
    };
    sessionsRepo = {
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    };
    apiKeysRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    service = new AccountService(
      usersRepo as unknown as Repository<User>,
      sessionsRepo as unknown as Repository<Session>,
      apiKeysRepo as unknown as Repository<ApiKey>,
    );
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('resolveDefaultAdminEmail', () => {
    it('defaults to admin@zaptura.io', () => {
      delete process.env.ADMIN_EMAIL;
      delete process.env.DEFAULT_ADMIN_EMAIL;
      expect(resolveDefaultAdminEmail()).toBe('admin@zaptura.io');
    });

    it('honors ADMIN_EMAIL environment variable', () => {
      process.env.ADMIN_EMAIL = 'custom-admin@example.com';
      expect(resolveDefaultAdminEmail()).toBe('custom-admin@example.com');
    });

    it('honors DEFAULT_ADMIN_EMAIL when ADMIN_EMAIL is unset', () => {
      delete process.env.ADMIN_EMAIL;
      process.env.DEFAULT_ADMIN_EMAIL = 'fallback-admin@example.com';
      expect(resolveDefaultAdminEmail()).toBe('fallback-admin@example.com');
    });
  });

  describe('resolveDefaultAdminPassword', () => {
    it('generates a 32-hex char random password by default', () => {
      delete process.env.ADMIN_PASSWORD;
      delete process.env.DEFAULT_ADMIN_PASSWORD;
      delete process.env.ALLOW_DEV_API_KEY;

      const res = resolveDefaultAdminPassword();
      expect(res.isGenerated).toBe(true);
      expect(res.password).toMatch(/^[a-f0-9]{32}$/);
    });

    it('honors ADMIN_PASSWORD', () => {
      process.env.ADMIN_PASSWORD = 'my-explicit-admin-password';
      const res = resolveDefaultAdminPassword();
      expect(res.isGenerated).toBe(false);
      expect(res.password).toBe('my-explicit-admin-password');
    });

    it('honors ALLOW_DEV_API_KEY=true with dev-admin-password', () => {
      delete process.env.ADMIN_PASSWORD;
      delete process.env.DEFAULT_ADMIN_PASSWORD;
      process.env.ALLOW_DEV_API_KEY = 'true';

      const res = resolveDefaultAdminPassword();
      expect(res.isGenerated).toBe(false);
      expect(res.password).toBe('dev-admin-password');
    });
  });

  describe('ensureDefaultAdminUser', () => {
    it('creates default admin user with business plan when not existing', async () => {
      usersRepo.findOne!.mockResolvedValue(null);
      usersRepo.save!.mockImplementation(u => Promise.resolve({ ...u, id: 'admin-uuid-1' }));

      const res = await service.ensureDefaultAdminUser();

      expect(res.isNew).toBe(true);
      expect(res.user.email).toBe('admin@zaptura.io');
      expect(res.user.name).toBe('Admin');
      expect(res.user.plan).toBe('business');
      expect(typeof res.rawPassword).toBe('string');
      expect(usersRepo.save).toHaveBeenCalled();
    });

    it('returns existing admin user without generating new password when already present', async () => {
      const existingUser: Partial<User> = {
        id: 'existing-admin-uuid',
        email: 'admin@zaptura.io',
        name: 'Admin',
        plan: 'business',
      };
      usersRepo.findOne!.mockResolvedValue(existingUser);

      const res = await service.ensureDefaultAdminUser();

      expect(res.isNew).toBe(false);
      expect(res.user).toBe(existingUser);
      expect(res.rawPassword).toBeUndefined();
      expect(usersRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('register & login', () => {
    it('registers a new user and hashes password', async () => {
      usersRepo.findOne!.mockResolvedValue(null);
      usersRepo.save!.mockImplementation(u => Promise.resolve({ ...u, id: 'u1' }));

      const res = await service.register({ name: 'Alice', email: 'alice@example.com', password: 'secretpassword123' });

      expect(res.id).toBe('u1');
      expect(res.email).toBe('alice@example.com');
      expect(res.plan).toBe('starter');
      expect(typeof res.token).toBe('string');
    });

    it('throws ConflictException on duplicate email', async () => {
      usersRepo.findOne!.mockResolvedValue({ id: 'existing' });

      await expect(service.register({ name: 'Bob', email: 'bob@example.com', password: 'pass' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('logs in successfully with correct password', async () => {
      const hash = hashPassword('correctpass');
      usersRepo.findOne!.mockResolvedValue({
        id: 'u2',
        email: 'user@example.com',
        name: 'User',
        plan: 'starter',
        passwordHash: hash,
      });

      const res = await service.login('user@example.com', 'correctpass');
      expect(res.id).toBe('u2');
      expect(res.email).toBe('user@example.com');
      expect(typeof res.token).toBe('string');
    });

    it('throws UnauthorizedException on bad password or missing user', async () => {
      usersRepo.findOne!.mockResolvedValue(null);
      await expect(service.login('nobody@example.com', 'pass')).rejects.toThrow(UnauthorizedException);

      const hash = hashPassword('correctpass');
      usersRepo.findOne!.mockResolvedValue({ id: 'u2', email: 'user@example.com', passwordHash: hash });
      await expect(service.login('user@example.com', 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('actorFromToken', () => {
    it('returns ApiKeyRole.ADMIN and allowedSessions: null for the default admin user', async () => {
      const adminToken = signUserToken(
        { sub: 'admin-id', email: 'admin@zaptura.io', name: 'Admin', plan: 'business' },
        service.jwtSecret(),
      );
      usersRepo.findOne!.mockResolvedValue({
        id: 'admin-id',
        email: 'admin@zaptura.io',
        name: 'Admin',
        plan: 'business',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const actor = await service.actorFromToken(adminToken);

      expect(actor.id).toBe('user:admin-id');
      expect(actor.role).toBe(ApiKeyRole.ADMIN);
      expect(actor.allowedSessions).toBeNull();
      expect(actor.userId).toBe('admin-id');
    });

    it('returns ApiKeyRole.OPERATOR and scoped allowedSessions for regular tenants', async () => {
      const tenantToken = signUserToken(
        { sub: 'tenant-id', email: 'tenant@example.com', name: 'Tenant', plan: 'starter' },
        service.jwtSecret(),
      );
      usersRepo.findOne!.mockResolvedValue({
        id: 'tenant-id',
        email: 'tenant@example.com',
        name: 'Tenant',
        plan: 'starter',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      sessionsRepo.find!.mockResolvedValue([{ id: 'sess-1' }]);

      const actor = await service.actorFromToken(tenantToken);

      expect(actor.id).toBe('user:tenant-id');
      expect(actor.role).toBe(ApiKeyRole.OPERATOR);
      expect(actor.allowedSessions).toEqual(['sess-1']);
      expect(actor.userId).toBe('tenant-id');
    });

    it('returns ApiKeyRole.ADMIN if user has an active ADMIN key linked', async () => {
      const customAdminToken = signUserToken(
        { sub: 'custom-admin-id', email: 'custom@other.com', name: 'Custom Admin', plan: 'business' },
        service.jwtSecret(),
      );
      usersRepo.findOne!.mockResolvedValue({
        id: 'custom-admin-id',
        email: 'custom@other.com',
        name: 'Custom Admin',
        plan: 'business',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      apiKeysRepo.findOne!.mockResolvedValue({
        id: 'k1',
        userId: 'custom-admin-id',
        role: ApiKeyRole.ADMIN,
        isActive: true,
      });

      const actor = await service.actorFromToken(customAdminToken);

      expect(actor.role).toBe(ApiKeyRole.ADMIN);
      expect(actor.allowedSessions).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('throws UnauthorizedException if account is not found', async () => {
      usersRepo.findOne!.mockResolvedValue(null);
      await expect(service.changePassword('missing-id', 'old', 'new-pass-123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if current password does not match', async () => {
      const user = {
        id: 'u1',
        email: 'user@example.com',
        passwordHash: hashPassword('correct-old-password'),
      };
      usersRepo.findOne!.mockResolvedValue(user);

      await expect(service.changePassword('u1', 'wrong-old-password', 'new-pass-123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('updates password hash and saves user when current password matches', async () => {
      const user = {
        id: 'u1',
        email: 'user@example.com',
        passwordHash: hashPassword('correct-old-password'),
      };
      usersRepo.findOne!.mockResolvedValue(user);
      usersRepo.save!.mockImplementation(u => Promise.resolve(u));

      const updated = await service.changePassword('u1', 'correct-old-password', 'brand-new-secret-123');

      expect(usersRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'u1',
        }),
      );
      expect(updated.passwordHash).not.toBe(user.passwordHash);
    });
  });
});

